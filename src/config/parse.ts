import fs from 'fs';
import path from 'path';
import { WebpackConfig } from './webpack';
import { VueCliConfig } from './vuecli';

export async function parseWebpackConfig (
  configPath: string
): Promise<WebpackConfig> {
  // first of all, parse webpack config from path : ${__dirname}/webpack.config.js
  let webpackConfig: WebpackConfig = {}
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
  const devConfigPath = path.resolve(buildDir, 'webpack.dev.js')
  if (!fs.existsSync(devConfigPath)) {
    console.error(`${devConfigPath} not exists`)
    return webpackConfig
  }
  await import(devConfigPath).then((config) => {
    webpackConfig = config
  })

  return webpackConfig
}

export async function parseVueCliConfig (
  configPath: string
): Promise<VueCliConfig> {
  let vueCliConfig: VueCliConfig = {}
  if (fs.existsSync(configPath)) {
    await import(configPath).then((config) => {
      vueCliConfig = config
    })
  }
  return vueCliConfig
}
