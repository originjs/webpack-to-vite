import type { TransformContext } from './context';
import type { ViteConfig } from '../config/vite';
import { RawValue } from '../config/vite';
import { VueCliTransformer } from './transformVuecli';
import { WebpackTransformer } from './transformWebpack';
import { recordConver } from '../utils/report'
import type { AstParsingResult } from '../ast-parse/astParse';
import type { WebpackPluginInstance } from 'webpack';
import type { UserOptions, InjectOptions } from '../config/config';
import { serializeObject } from '../generate/render';
import { getProjectName } from '../utils/config';

/**
 * general implementation for vue.config.js and webpack.config.js
 *
 */
export interface Transformer{
    context: TransformContext;

    transform(rootDir: string, astParsingResult?: AstParsingResult): Promise<ViteConfig>;

}

export function initViteConfig () : ViteConfig {
  const config : ViteConfig = {}

  const defaultAlias = []
  defaultAlias.push({ find: new RawValue('/^~/'), replacement: '' });
  defaultAlias.push({ find: '', replacement: new RawValue('path.resolve(__dirname,\'src\')') });

  config.resolve = {};
  config.resolve.alias = defaultAlias;
  config.resolve.extensions = [
    '.mjs',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.json',
    '.vue'
  ];

  return config;
}

export function getTransformer (projectType: string) : Transformer {
  if (projectType === 'vue-cli') {
    return new VueCliTransformer()
  }
  if (projectType === 'webpack') {
    return new WebpackTransformer()
  }

  return new VueCliTransformer()
}

export function transformImporters (context: TransformContext, astParsingResult?: AstParsingResult) : void {
  const plugins: RawValue[] = []
  if (context.vueVersion === 3) {
    context.importers.push({
      key: '@vitejs/plugin-vue',
      value: 'import vue from \'@vitejs/plugin-vue\';'
    })
    plugins.push(new RawValue('vue()'))
    context.importers.push({
      key: '@vitejs/plugin-vue-jsx',
      value: 'import vueJsx from \'@vitejs/plugin-vue-jsx\';'
    })
    plugins.push(new RawValue('vueJsx()'))
  } else if (context.vueVersion === 2) {
    context.importers.push({
      key: 'vite-plugin-vue2',
      value: 'import { createVuePlugin } from \'vite-plugin-vue2\';'
    })
    plugins.push(new RawValue('createVuePlugin({ jsx: true })'))
  }
  if (astParsingResult && astParsingResult.parsingResult.FindRequireContextParser && astParsingResult.parsingResult.FindRequireContextParser.length > 0) {
    context.importers.push({
      key: '@originjs/vite-plugin-require-context',
      value: 'import ViteRequireContext from \'@originjs/vite-plugin-require-context\';'
    })
    plugins.push(new RawValue('ViteRequireContext()'))
  }
  recordConver({ num: 'B04', feat: 'required plugins' })
  context.importers.push({
    key: 'vite-plugin-env-compatible',
    value: 'import envCompatible from \'vite-plugin-env-compatible\';'
  })
  context.importers.push({
    key: 'vite-plugin-html',
    value: 'import { createHtmlPlugin } from \'vite-plugin-html\';'
  })
  context.importers.push({
    key: '@originjs/vite-plugin-commonjs',
    value: 'import { viteCommonjs } from \'@originjs/vite-plugin-commonjs\';'
  })
  // TODO scan files to determine whether you need to add the plugin
  plugins.push(new RawValue('viteCommonjs()'))
  plugins.push(new RawValue('envCompatible()'))
  plugins.push(new RawValue('createHtmlPlugin()'))

  context.config.plugins = plugins
}

export function transformWebpackHtmlPlugin (htmlPlugin: WebpackPluginInstance, context: TransformContext, rootDir: string) {
  const userOptions: UserOptions = {}

  const injectHtmlPluginOption: InjectOptions = {}
  const data = {
    title: getProjectName(rootDir)
  }
  if (htmlPlugin && htmlPlugin.options) {
    // injectData
    Object.keys(htmlPlugin.options).forEach(key => {
      if ((key === 'title' || key === 'favicon') && htmlPlugin.options[key]) {
        data[key] = htmlPlugin.options[key]
      }
    })
    if (htmlPlugin.options?.templateParameters) {
      Object.assign(data, htmlPlugin.options.templateParameters)
    }
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
    context.config.plugins = context.config.plugins || []

    // minify
    if (htmlPlugin.options?.minify) {
      userOptions.minify = htmlPlugin.options.minify
    }
  }

  injectHtmlPluginOption.data = data
  userOptions.inject = injectHtmlPluginOption

  const injectHtmlPluginIndex = context.config.plugins.findIndex(p => p.value === 'createHtmlPlugin()')
  if (injectHtmlPluginIndex >= 0) {
    context.config.plugins[injectHtmlPluginIndex] = new RawValue('createHtmlPlugin(' + serializeObject(userOptions, '    ') + ')')
  } else {
    context.config.plugins.push(new RawValue('createHtmlPlugin(' + serializeObject(userOptions, '    ') + ')'))
  }
  if (context.importers.findIndex(importer => importer.key === 'vite-plugin-html') < 0) {
    context.importers.push({
      key: 'vite-plugin-html',
      value: 'import { createHtmlPlugin } from \'vite-plugin-html\';'
    })
  }
}
