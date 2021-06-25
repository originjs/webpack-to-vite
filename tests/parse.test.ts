import path from 'path';
// import fs from 'fs';
import { parseVueCliConfig, parseWebpackConfig } from '../src/config/parse';
import { WebpackConfig } from '../src/config/webpack';
import { VueCliConfig } from '../src/config/vuecli';

test('parse webpack.config.js', async () => {
  let webpackConfig: WebpackConfig = {};
  const configPath = path.resolve('tests/testdata/webpack/webpack.config.js');
  await parseWebpackConfig(configPath).then(res => {
    webpackConfig = res;
  });
  expect(webpackConfig.entry).toEqual('./main.js');
});

test('parse build/webpack.dev.js', async () => {
  let webpackConfig: WebpackConfig = {};
  const filePath = path.resolve('tests/testdata/webpack/build/webpack.dev.js');
  await parseWebpackConfig(filePath).then(res => {
    webpackConfig = res
  })
  expect(webpackConfig.entry['app']).toEqual('./src/app.js');
})

test('parseVueCliConfig', async () => {
  let vueCliConfig: VueCliConfig = {}
  const configPath = path.resolve('tests/testdata/vue.config.js');
  await parseVueCliConfig(configPath).then(res => {
    vueCliConfig = res;
  });
  expect(vueCliConfig.baseUrl).toEqual('/src');
});
