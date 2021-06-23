import { parseVueCliConfig } from '../config/parse'
import Config from 'webpack-chain'
import merge from 'webpack-merge'
import { initViteConfig, Transformer, transformImporters } from './transformer'
import { ViteConfig, RawValue } from '../config/vite'
import path from 'path'
import { TransformContext } from './context'
import { getVueVersion } from '../utils/version'
import { DEFAULT_VUE_VERSION } from '../constants/constants'

/**
 * parse vue.config.js options and transform to vite.config.js
 */
export class VueCliTransformer implements Transformer {
    context : TransformContext = {
      vueVersion: DEFAULT_VUE_VERSION,
      config: initViteConfig(),
      importers: []
    }

    public async transform (rootDir: string): Promise<ViteConfig> {
      this.context.vueVersion = getVueVersion(rootDir)
      transformImporters(this.context)
      const config = this.context.config

      const vueConfigFile = path.resolve(rootDir, 'vue.config.js')
      const vueConfig = await parseVueCliConfig(vueConfigFile)

      const css = vueConfig.css || {}

      // Base public path
      config.base =
            process.env.PUBLIC_URL || vueConfig.publicPath || vueConfig.baseUrl

      // css options
      if (css.loaderOptions) {
        config.css = {}
        config.css.preprocessorOptions = css.loaderOptions
        if (config.css.preprocessorOptions?.sass?.additionalData?.indexOf('scss') && !Object.prototype.hasOwnProperty.call(config.css.preprocessorOptions, 'scss')) {
          config.css.preprocessorOptions.scss = JSON.parse(JSON.stringify(css.loaderOptions.sass))
        }
      }

      // server options
      vueConfig.devServer && this.transformDevServer(vueConfig, config)

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

      // alias
      const chainableConfig = new Config()
      if (vueConfig.chainWebpack) {
        vueConfig.chainWebpack(chainableConfig)
      }
      const aliasOfChainWebpack = chainableConfig.resolve.alias.entries()
      const aliasOfConfigureWebpackObjectMode =
            vueConfig?.configureWebpack?.resolve?.alias || {}
      const aliasOfConfigureFunctionMode = (() => {
        if (typeof vueConfig.configureWebpack === 'function') {
          let originConfig = chainableConfig.toConfig()
          const res = vueConfig.configureWebpack(originConfig)
          originConfig = merge(originConfig, res)
          if (res) {
            return res.resolve.alias || {}
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
        const relativePath = path.relative(rootDir, alias[key]).replace(/\\/g, '/')
        defaultAlias.push({
          find: key,
          replacement: new RawValue(`path.resolve(__dirname,'${relativePath}')`)
        })
      })

      config.resolve.alias = defaultAlias
      return config
    }

    public transformDevServer (vueConfig, config): void {
      const devServer = vueConfig.devServer
      config.server = {}
      config.server.strictPort = false
      config.server.port = Number(process.env.PORT) || devServer.port
      const host = process.env.DEV_HOST || devServer.public || devServer.host
      if (host) {
        config.server.host = host
          .replace('http://', '')
          .replace('https://', '')
      }
      config.server.open = devServer.open
      config.server.https = devServer.https
      const proxy = devServer.proxy
      if (typeof proxy === 'object') {
        for (const proxyKey in proxy) {
          if (Object.prototype.hasOwnProperty.call(proxy, proxyKey)) {
            const pathRewrite = proxy[proxyKey].pathRewrite
            if (!pathRewrite) {
              break
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
      config.server.proxy = proxy
    }
}
