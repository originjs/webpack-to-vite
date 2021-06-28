import { parseWebpackConfig } from '../config/parse'
import { RawValue, ViteConfig } from '../config/vite'
import { TransformContext } from './context'
import { initViteConfig, Transformer, transformImporters } from './transformer'
import path from 'path'
import { DEFAULT_VUE_VERSION } from '../constants/constants'

// convert webpack.config.js => vite.config.js
export class WebpackTransformer implements Transformer {
    context : TransformContext = {
      vueVersion: DEFAULT_VUE_VERSION,
      config: initViteConfig(),
      importers: []
    }

    public async transform (rootDir: string): Promise<ViteConfig> {
      const webpackConfig = await parseWebpackConfig(path.resolve(rootDir, 'webpack.config.js'))
      transformImporters(this.context)
      const config = this.context.config

      // convert base config
      // TODO: convert entry
      // webpack may have multiple entry files, e.g.
      // 1. one entry, with one entry file : e.g. entry: './app/index.js'
      // 2. one entry, with multiple entry files: e.g. entry: ['./pc/index.js','./wap/index.js']
      // 3. multiple entries e.g. entry: {
      //      wap: './pc/index.js',
      //      pc: './wap/index.js'
      // }
      config.mode = webpackConfig.mode
      config.build = {}

      // convert entry
      if (webpackConfig.entry !== '' && webpackConfig.entry !== null) {
        config.build.rollupOptions = {}
        config.build.rollupOptions.input = webpackConfig.entry
      }
      // convert output
      if (webpackConfig.output?.path !== '') {
        const relativePath = path.relative(rootDir, webpackConfig.output.path).replace(/\\/g, '/')
        config.build.outDir = new RawValue(`path.resolve(__dirname, '${relativePath}')`)
      }

      // convert alias
      const defaultAlias = []

      const alias = {
        '@': `${rootDir}/src`
      }
      Object.keys(alias).forEach((key) => {
        const relativePath = path.relative(rootDir, alias[key]).replace(/\\/g, '/')
        defaultAlias.push({
          find: key,
          replacement: new RawValue(`path.resolve(__dirname,'${relativePath}')`)
        })
      })
      config.resolve.alias = defaultAlias

      // convert devServer
      config.server.host = webpackConfig.devServer.host
      config.server.port = webpackConfig.devServer.port
      config.server.proxy = webpackConfig.devServer.proxy
      config.server.https = webpackConfig.devServer.https
      config.server.base = webpackConfig.devServer.contentBase

      return config
    }
}
