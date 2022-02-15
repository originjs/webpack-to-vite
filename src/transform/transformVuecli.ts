import { applyAstParsingResultToConfig, parseVueCliConfig } from '../config/parse'
import Config from 'webpack-chain'
import merge from 'webpack-merge'
import type { Configuration } from 'webpack'
import { existsSync } from 'fs'
import type { Transformer } from './transformer';
import { initViteConfig, transformImporters } from './transformer'
import type { ViteConfig } from '../config/vite';
import { RawValue } from '../config/vite'
import path from 'path'
import type { TransformContext } from './context'
import { getVueVersion } from '../utils/version'
import { DEFAULT_VUE_VERSION, PARSER_TYPES } from '../constants/constants'
import { recordConver } from '../utils/report'
import type { ServerOptions } from 'vite';
import type { AstParsingResult } from '../ast-parse/astParse'
import { relativePathFormat } from '../utils/file'
import { serializeObject } from '../generate/render'
import type { InjectOptions } from '../config/config'
import { getHtmlPluginConfig } from '../utils/config'

/**
 * parse vue.config.js options and transform to vite.config.js
 */
export class VueCliTransformer implements Transformer {
    context : TransformContext = {
      vueVersion: DEFAULT_VUE_VERSION,
      config: initViteConfig(),
      importers: []
    }

    public async transform (rootDir: string, astParsingResult?: AstParsingResult): Promise<ViteConfig> {
      this.context.vueVersion = getVueVersion(rootDir)
      transformImporters(this.context, astParsingResult)
      const config = this.context.config
      const vueConfigPath = existsSync(path.resolve(rootDir, 'vue.temp.config.ts')) ? path.resolve(rootDir, 'vue.temp.config.ts') : path.resolve(rootDir, 'vue.temp.config.js')
      const vueConfig = await parseVueCliConfig(vueConfigPath)

      let webpackConfig: Configuration = {}
      // vueConfig.configureWebpack
      if (vueConfig.configureWebpack && typeof vueConfig.configureWebpack !== 'function') {
        webpackConfig = vueConfig.configureWebpack
      } else if (vueConfig.configureWebpack && astParsingResult) {
        try {
          webpackConfig = applyAstParsingResultToConfig(webpackConfig, PARSER_TYPES.FindWebpackConfigProperties, astParsingResult.parsingResult)
          await vueConfig.configureWebpack(webpackConfig)
        } catch (e) {
          console.error('\nTransforming configureWebpack config failed. Please manually convert it.')
          console.error(e)
          console.log('skip transforming the configureWebpack...')
        }
      }

      // vueConfig.chainWebpack
      const chainableConfig = new Config()
      if (vueConfig.chainWebpack) {
        try {
          await vueConfig.chainWebpack(chainableConfig)
        } catch (e) {
          console.error('\nTransforming chainWebpack config failed. Please manually convert it.')
          console.error(e)
          console.log('skip transforming the chainWebpack...')
        }
      }

      webpackConfig = merge(chainableConfig.toConfig(), webpackConfig)

      const htmlPlugin = getHtmlPluginConfig(vueConfig, webpackConfig, astParsingResult?.parsingResult)

      // Base public path
      config.base =
            process.env.PUBLIC_URL || vueConfig.publicPath || vueConfig.baseUrl || htmlPlugin?.options?.publicPath
      recordConver({ num: 'V01', feat: 'base public path' })

      // css options
      const css = vueConfig.css || {}
      if (css.loaderOptions) {
        config.css = {}
        const strfy = JSON.stringify(css.loaderOptions)
        config.css.preprocessorOptions = JSON.parse(strfy)
        if (css.loaderOptions?.less?.lessOptions?.modifyVars) {
          config.css.preprocessorOptions.less.modifyVars = JSON.parse(strfy).less.lessOptions.modifyVars
          delete config.css.preprocessorOptions.less.lessOptions.modifyVars
        }
        if (css.loaderOptions?.sass?.additionalData?.indexOf('scss') && !Object.prototype.hasOwnProperty.call(css.loaderOptions, 'scss')) {
          config.css.preprocessorOptions.scss = JSON.parse(strfy).sass
        }
      }
      recordConver({ num: 'V02', feat: 'css options' })

      // css automatic imports
      const pluginOptions = vueConfig.pluginOptions || {}
      if (pluginOptions['style-resources-loader']) {
        this.transformGlobalCssImports(rootDir, pluginOptions, config);
        recordConver({ num: 'V07', feat: 'css automatic imports' })
      }

      // server options
      if (vueConfig.devServer) {
        config.server = this.transformDevServer(vueConfig.devServer)
        recordConver({ num: 'V03', feat: 'server options' })
      } else if (vueConfig?.configureWebpack?.devServer) {
        config.server = this.transformDevServer(vueConfig.configureWebpack.devServer)
        recordConver({ num: 'V03', feat: 'server options' })
      }

      // build options
      config.build = config.build || {}
      config.build.outDir = vueConfig.outputDir
      const cssCodeSplit = Boolean(css.extract)
      if (cssCodeSplit) {
        config.build.cssCodeSplit = cssCodeSplit
      }
      config.build.minify = process.env.MODERN === 'true' ? 'esbuild' : undefined
      config.build.sourcemap =
            process.env.GENERATE_SOURCEMAP === 'true' ||
            vueConfig.productionSourceMap ||
            css.sourceMap
      recordConver({ num: 'V03', feat: 'build options' })

      // alias
      const aliasOfChainWebpack = chainableConfig.resolve.alias.entries()
      const aliasOfConfigureWebpackObjectMode =
            vueConfig?.configureWebpack?.resolve?.alias || {}
      const aliasOfConfigureFunctionMode = (() => {
        if (typeof vueConfig.configureWebpack === 'function') {
          let originConfig = chainableConfig.toConfig()
          originConfig = merge(originConfig, webpackConfig)
          if (webpackConfig) {
            return webpackConfig.resolve?.alias || {}
          }
          return (originConfig.resolve && originConfig.resolve.alias) || {}
        }
      })()
      const defaultAlias = []
      defaultAlias.push({ find: new RawValue('/^~/'), replacement: '' })
      const alias = {
        '@': `${rootDir}/src`,
        ...aliasOfConfigureWebpackObjectMode,
        ...aliasOfConfigureFunctionMode,
        ...aliasOfChainWebpack
      }
      Object.keys(alias).forEach((key) => {
        const relativePath = relativePathFormat(rootDir, path.resolve(rootDir, alias[key]))
        defaultAlias.push({
          find: key,
          replacement: new RawValue(`path.resolve(__dirname, '${relativePath}')`)
        })
      })

      config.resolve.alias = defaultAlias
      recordConver({ num: 'V05', feat: 'resolve.alias options' })

      // html-webpack-plugin
      if (htmlPlugin && htmlPlugin.options) {
        // injectData
        const injectHtmlPluginOption: InjectOptions = {}
        const data = {
          title: 'Vite App'
        }
        Object.keys(htmlPlugin.options).forEach(key => {
          if ((key === 'title' || key === 'favicon') && htmlPlugin.options[key]) {
            data[key] = htmlPlugin.options[key]
          }
        })
        if (htmlPlugin.options?.templateParameters) {
          Object.assign(data, htmlPlugin.options.templateParameters)
        }
        injectHtmlPluginOption.data = data
        if (htmlPlugin.options?.meta) {
          injectHtmlPluginOption.tags = []
          Object.keys(htmlPlugin.options.meta).forEach(key => {
            if (htmlPlugin.options.meta[key]) {
              injectHtmlPluginOption.tags.push({
                tag: 'meta',
                attrs: {
                  name: key,
                  content: htmlPlugin.options.meta[key],
                  injectTo: 'head'
                }
              })
            }
          })
        }
        this.context.config.plugins = this.context.config.plugins || []
        const injectHtmlPluginIndex = this.context.config.plugins.findIndex(p => p.value === 'injectHtml()')
        if (injectHtmlPluginIndex >= 0) {
          this.context.config.plugins[injectHtmlPluginIndex] = new RawValue('injectHtml(' + serializeObject(injectHtmlPluginOption, '    ') + ')')
        } else {
          this.context.config.plugins.push(new RawValue('injectHtml(' + serializeObject(injectHtmlPluginOption, '    ') + ')'))
        }
        if (this.context.importers.findIndex(importer => importer.key === 'vite-plugin-html') < 0) {
          this.context.importers.push({
            key: 'vite-plugin-html',
            value: 'import { injectHtml } from \'vite-plugin-html\';'
          })
        }
        // minify
        if (htmlPlugin.options?.minify) {
          const vitePluginHtmlImporterIndex = this.context.importers.findIndex(importer => importer.key === 'vite-plugin-html')
          if (vitePluginHtmlImporterIndex >= 0) {
            const minifyHtmlImporter = 'import { injectHtml, minifyHtml } from \'vite-plugin-html\';'
            this.context.importers[vitePluginHtmlImporterIndex].value = minifyHtmlImporter
          } else {
            this.context.importers.push({
              key: 'vite-plugin-html',
              value: 'import { minifyHtml } from \'vite-plugin-html\';'
            })
          }
          this.context.config.plugins = this.context.config.plugins || []
          this.context.config.plugins.push(new RawValue('minifyHtml(' + serializeObject(htmlPlugin.options.minify, '    ') + ')'))
        }
      }
      recordConver({ num: 'B11', feat: 'html-webpack-plugin is supported' })

      return config
    }

    public transformDevServer (devServer): ServerOptions {
      let server: ServerOptions = {}
      server = {}
      server.strictPort = false
      server.port = Number(process.env.PORT) || devServer.port
      const host = process.env.DEV_HOST || devServer.public || devServer.host
      if (host) {
        server.host = host
          .replace('http://', '')
          .replace('https://', '')
      }
      server.open = devServer.open
      server.https = devServer.https
      const proxy = devServer.proxy
      if (typeof proxy === 'object') {
        for (const proxyKey in proxy) {
          if (Object.prototype.hasOwnProperty.call(proxy, proxyKey)) {
            const pathRewrite = proxy[proxyKey].pathRewrite
            if (!pathRewrite) {
              continue
            }
            if (typeof pathRewrite === 'object') {
              Object.keys(pathRewrite).forEach(key => {
                const content = new RegExp(key)
                const replaceContent = pathRewrite[key] || "''"
                proxy[proxyKey].rewrite = new RawValue(`(path) => path.replace(${content}, ${replaceContent})`)
              })
            }
            if (typeof pathRewrite === 'function') {
              proxy[proxyKey].rewrite = proxy[proxyKey].pathRewrite
            }
            delete proxy[proxyKey].pathRewrite
          }
        }
      }
      server.proxy = proxy
      return server
    }

    public transformGlobalCssImports (rootDir: string, pluginOptions, config: ViteConfig) {
      let additionalData = '';
      const preProcessor = pluginOptions['style-resources-loader'].preProcessor;
      const patterns = pluginOptions['style-resources-loader'].patterns;
      patterns.forEach(pattern => {
        additionalData = additionalData + '@import "' + pattern.slice(rootDir.length + 1).replace(/\\/g, '/') + '";';
      });
      if (preProcessor === 'less') {
        if (config?.css?.preprocessorOptions?.less?.additionalData) {
          additionalData += config.css.preprocessorOptions.less.additionalData
          config.css.preprocessorOptions.less.additionalData = additionalData;
        }
      } else if (preProcessor === 'scss') {
        if (config?.css?.preprocessorOptions?.scss?.additionalData) {
          additionalData += config.css.preprocessorOptions.scss.additionalData
          config.css.preprocessorOptions.scss.additionalData = additionalData;
        }
      } else if (preProcessor === 'styl') {
        if (config?.css?.preprocessorOptions?.styl?.additionalData) {
          additionalData += config.css.preprocessorOptions.styl.additionalData
          config.css.preprocessorOptions.styl.additionalData = additionalData;
        }
      }
    }
}
