import type { TransformContext } from './context';
import type { ViteConfig } from '../config/vite';
import { RawValue } from '../config/vite';
import { VueCliTransformer } from './transformVuecli';
import { WebpackTransformer } from './transformWebpack';
import { recordConver } from '../utils/report'
import type { AstParsingResult } from '../ast-parse/astParse';

/**
 * general implementation for vue.config.js and webpack.config.js
 *
 */
export interface Transformer{
    context: TransformContext;

    transform(rootDir: string, astParsingResult?: AstParsingResult, outDir?: string): Promise<ViteConfig>;

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
    value: 'import { injectHtml } from \'vite-plugin-html\';'
  })
  context.importers.push({
    key: '@originjs/vite-plugin-commonjs',
    value: 'import { viteCommonjs } from \'@originjs/vite-plugin-commonjs\';'
  })
  // TODO scan files to determine whether you need to add the plugin
  plugins.push(new RawValue('viteCommonjs()'))
  plugins.push(new RawValue('envCompatible()'))
  plugins.push(new RawValue('injectHtml()'))

  context.config.plugins = plugins
}
