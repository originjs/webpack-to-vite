import { parseVueCliConfig, parseWebpackConfig } from "../src/config/parse";
import { WebpackConfig } from "../src/config/webpack";
import path from 'path';
import { VueCliConfig } from "../src/config/vuecli";

test('parseWebpackConfig', async () => {
    let webpackConfig: WebpackConfig = {} ;
    const configPath = path.resolve('tests/testdata/webpack.config.js');
    await parseWebpackConfig(configPath).then(res => {
        webpackConfig = res ;
    });
    expect(webpackConfig.entry).toEqual('./main.js');
});

test('parseVueCliConfig', async () => {
    let vueCliConfig: VueCliConfig = {}
    const configPath = path.resolve('tests/testdata/vue.config.js');
    await parseVueCliConfig(configPath).then(res => {
        vueCliConfig = res ;
    });
    expect(vueCliConfig.baseUrl).toEqual('/src');
});
