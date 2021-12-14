import fs from 'fs';
import path from 'path';
import { WebpackConfig } from './webpack';
import { VueCliConfig } from './vuecli';

export async function parseWebpackConfig (
  configPath: string
): Promise<WebpackConfig> {
  let webpackConfig: WebpackConfig = {}

  // first, parse webpack config from path : ${__dirname}/webpack.config.js
  if (fs.existsSync(configPath)) {
    try {
      await import(configPath).then((config) => {
        webpackConfig = config
      })
      return webpackConfig
    } catch (e) {
      if (e.message.includes(configPath)) {
        console.error(`\nFailed to parse webpack config from default file path: ${configPath}.`)
      } else {
        throw e
      }
    }
  }
  // if webpack.config.js not exists in ${__dirname}/webpack.config.js, scan folder ${__dirname}/build/
  const dir = path.dirname(configPath)
  let buildDir = path.resolve(dir, 'build')
  // if folder ${__dirname}/build/ not exists, scan folder ${__dirname}/webpack/
  if (!fs.existsSync(buildDir)) {
    buildDir = path.resolve(dir, 'webpack')
  }
  // default config files: webpack.base.js、webpack.dev.js、webpack.prod.js|webpack.build.js|webpack.production.js
  // TODO: production config
  const devConfigPath = path.resolve(buildDir, 'webpack.dev.conf.js')
  try {
    await import(devConfigPath).then((config) => {
      webpackConfig = config
    })
  } catch (e) {
    if (e.message.includes(devConfigPath)) {
      console.error(`\nFailed to parse webpack config from default file path: ${devConfigPath}.`)
      console.warn('Note: webpack conversion is based on `webpack.config.js` or' +
        ' `webpack.base.js/webpack.dev.js/webpack.prod.js` or' +
        ' `webpack.build.js/webpack.production.js`, map configuration to `vite.config.js`. ' +
        '\nIf you are not using configuration files above, you need to convert configurations manually.')
      console.log(`Using default webpack config: ${JSON.stringify(webpackConfig)}.`)
    } else {
      throw e
    }
  }

  return webpackConfig
}

export async function parseVueCliConfig (
  configPath: string
): Promise<VueCliConfig> {
  let vueCliConfig: VueCliConfig = {}
  try {
    if (fs.existsSync(configPath)) {
      await import(configPath).then((config) => {
        vueCliConfig = config
      })
    }
  } catch (e) {
    if (e.message.includes(configPath)) {
      console.error(`\nFailed to parse vue config from default file path: ${configPath}.`)
      console.log(`Using default vue config: ${JSON.stringify(vueCliConfig)}.`)
    } else {
      throw e
    }
  }
  return vueCliConfig
}
