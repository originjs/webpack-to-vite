import path from 'path';
import { parseVueCliConfig, parseWebpackConfig } from '../src/config/parse';
import { WebpackConfig } from '../src/config/webpack';
import { VueCliConfig } from '../src/config/vuecli';
import fs from "fs";
import {copyDirSync} from "../src/utils/file";

beforeEach(() => {
  fs.mkdirSync(path.resolve('tests/out-parse'), { recursive: true })
})
afterEach(() => {
  fs.rmdirSync(path.resolve('tests/out-parse'), { recursive: true })
})

describe('parseWebpackConfig', () => {
  test('parse webpack.config.js', async () => {
    const srcPath: string = path.resolve('tests/testdata/transform-webpack/webpack.config.js')
    const destPath: string = path.resolve('tests/out-parse/webpack.config.js')
    fs.copyFileSync(srcPath, destPath)

    const configPath: string = path.resolve('tests/out-parse/webpack.config.js');
    const webpackConfig: WebpackConfig = await parseWebpackConfig(configPath)
    expect(webpackConfig.entry).toEqual('./main.js');
    expect(webpackConfig.plugins.length).toBe(1)
  });

  test('parse build/webpack.dev.conf.js', async () => {
    const srcPath: string = path.resolve('tests/testdata/transform-webpack/build')
    const destPath: string = path.resolve('tests/out-parse/build')
    copyDirSync(srcPath, destPath)

    const configPath: string = path.resolve('tests/out-parse/webpack.config.js');
    const webpackConfig: WebpackConfig = await parseWebpackConfig(configPath)
    expect(webpackConfig.entry).toEqual({"app": "./app.js"});
  })

  test('parse webpack/webpack.dev.conf.js', async () => {
    const srcPath: string = path.resolve('tests/testdata/transform-webpack/webpack')
    const destPath: string = path.resolve('tests/out-parse/webpack')
    copyDirSync(srcPath, destPath)

    const configPath: string = path.resolve('tests/out-parse/webpack.config.js');
    const webpackConfig: WebpackConfig = await parseWebpackConfig(configPath)
    expect(webpackConfig.entry).toEqual('./src/main.js');
  })

  test('parse webpack/custom.conf.js', async () => {
    const configPath: string = path.resolve('tests/out-parse/custom/custom.conf.js');
    const webpackConfig: WebpackConfig = await parseWebpackConfig(configPath)
    expect(webpackConfig).toEqual({});
  })
})

test('parseVueCliConfig', async () => {
  const srcPath: string = path.resolve('tests/testdata/transform-vue-cli/vue.temp.config.js')
  const destPath: string = path.resolve('tests/out-parse/vue.temp.config.js')
  fs.copyFileSync(srcPath, destPath)

  const configPath: string = path.resolve('tests/out-parse/vue.temp.config.js');
  const vueCliConfig: VueCliConfig = await parseVueCliConfig(configPath)
  expect(vueCliConfig.baseUrl).toEqual('/src');
  expect(vueCliConfig.productionSourceMap).toBe(true)
  expect(Boolean(vueCliConfig.configureWebpack)).toBe(true)
  expect(Boolean(vueCliConfig.chainWebpack)).toBe(true)
  expect(Boolean(vueCliConfig.devServer)).toBe(true)
  expect(Boolean(vueCliConfig.css.loaderOptions)).toBe(true)
  expect(Boolean(vueCliConfig.pluginOptions)).toBe(true)
});
