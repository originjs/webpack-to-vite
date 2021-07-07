import path from 'path'
import { parseWebpackConfig } from '../config/parse'
import { RawValue, ViteConfig } from '../config/vite'
import { TransformContext } from './context'
import { initViteConfig, Transformer, transformImporters } from './transformer'
import { DEFAULT_VUE_VERSION } from '../constants/constants'
import { Entry } from '../config/webpack'
import { isObject } from '../utils/common'

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
        if (isObject(webpackConfig.entry)) {
          config.build.rollupOptions.input = suitableFormat(webpackConfig.entry)
        } else if (typeof webpackConfig.entry === 'function') {
          config.build.rollupOptions.input = webpackConfig.entry()
        } else {
          config.build.rollupOptions.input = webpackConfig.entry
        }
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
      if (webpackConfig.resolve?.alias !== undefined) {
        Object.keys(webpackConfig.resolve.alias).forEach((key) => {
          alias[key] = webpackConfig.resolve.alias[key]
        })
      }

      Object.keys(alias).forEach((key) => {
        let relativePath = path.relative(rootDir, path.resolve(rootDir, alias[key]))
        relativePath = relativePath.replace(/\\/g, '/')
        if (key === 'vue$') {
          key = key.replace('$', '')
          relativePath = 'node_modules/' + relativePath
        }
        defaultAlias.push({
          find: key,
          replacement: new RawValue(`path.resolve(__dirname,'${relativePath}')`)
        })
      })
      config.resolve.alias = defaultAlias

      // convert devServer
      if (webpackConfig.devServer !== undefined) {
        config.server.host = webpackConfig.devServer.host
        config.server.port = webpackConfig.devServer.port
        config.server.proxy = webpackConfig.devServer.proxy
        config.server.https = webpackConfig.devServer.https
        config.server.base = webpackConfig.devServer.contentBase
      }

      // convert plugins
      // webpack.DefinePlugin
      config.define = {}
      webpackConfig.plugins.forEach((item : any) => {
        if (item.constructor.name === 'DefinePlugin') {
          Object.keys(item).forEach((definitions) => {
            const val = item[definitions]
            Object.keys(val).forEach((variable) => {
              config.define[variable] = val[variable]
            })
          })
        }
      })
      return config
    }
}

function suitableFormat (entry: Entry) : Entry {
  const res : Entry = {}
  Object.keys(entry).forEach(function (name) {
    if (!Array.isArray(entry[name])) {
      res[name] = entry[name]
      return
    }
    entry[name].forEach((item, index) => {
      const key = name.concat(index)
      res[key] = item
    })
  });
  return res
}
