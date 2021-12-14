import fs from 'fs';
import path from 'path';
import { WebpackConfig } from './webpack';
import { VueCliConfig } from './vuecli';

export async function parseWebpackConfig (
  configPath: string
): Promise<WebpackConfig> {
  let webpackConfig: WebpackConfig = {}

  try {
    // first, parse webpack config from path : ${__dirname}/webpack.config.js
    if (fs.existsSync(configPath)) {
      await import(configPath).then((config) => {
        webpackConfig = config
      });
      return webpackConfig
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
    await import(devConfigPath).then((config) => {
      webpackConfig = config
    })
  } catch (e) {
    console.error(`\nFailed to parse webpack config from default file path: ${configPath}.`)
    console.warn('Note: webpack conversion is based on `webpack.config.js` or' +
      ' `webpack.base.js/webpack.dev.js/webpack.prod.js` or' +
      ' `webpack.build.js/webpack.production.js`, map configuration to `vite.config.js`\n' +
      'If you are not using configuration files above, you need to convert configurations manually.')
    console.error(e)
    console.log(`Using default webpack config: ${JSON.stringify(webpackConfig)}.`)
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
    console.error(`\nFailed to parse vue config from default file path: ${configPath}.`)
    console.error(e)
    console.log(`Using default vue config: ${JSON.stringify(vueCliConfig)}.`)
  }
  return vueCliConfig
}
