import { parseVueCliConfig } from '../config/parse';
import { removeUndefined } from '../utils/version';
import Config from 'webpack-chain';
import merge from 'webpack-merge';
import { Transformer } from './transformer';
import { ViteConfig, RawValue } from '../config/vite';
import path from 'path';
import { TransformContext } from './context';
import { getVueVersion } from '../utils/version';
import { DEFAULT_VUE_VERSION } from '../constants/constants';

/**
 * parse vue.config.js options and transform to vite.config.js
 */
export class VueCliTransformer implements Transformer {

    context : TransformContext = {
        vueVersion: DEFAULT_VUE_VERSION,
        jsx: this.useJsx(),
        config: {},
        importList: [],
    }

    public async transform(rootDir: string): Promise<ViteConfig> {
        this.context.vueVersion = getVueVersion(rootDir);
        this.transformVue(this.context);
        let config = this.context.config;

        const vueConfigFile = path.resolve(rootDir, 'vue.config.js');
        const vueConfig = await parseVueCliConfig(vueConfigFile);

        const css = vueConfig.css || {};

        //Base public path
        config.base =
            process.env.PUBLIC_URL || vueConfig.publicPath || vueConfig.baseUrl;

        // css options
        if (css.loaderOptions) {
            config.css = {};
            config.css.preprocessorOptions = css.loaderOptions;
        }

        // server options
        if (vueConfig.devServer) {
            const devServer = vueConfig.devServer;
            config.server = {};
            config.server.strictPort = false;
            config.server.port = Number(process.env.PORT) || devServer.port;
            const host = process.env.DEV_HOST || devServer.public || devServer.host;
            if(host) {
                config.server.host = host
                    .replace('http://', '')
                    .replace('https://', '');
            }
            config.server.open = devServer.open;
            config.server.https = devServer.https;
            config.server.proxy = devServer.proxy;
        }

        //build options
        config.build = config.build || {};
        config.build.outDir = vueConfig.outputDir;
        const cssCodeSplit = Boolean(css.extract);
        if (cssCodeSplit) {
            config.build.cssCodeSplit = cssCodeSplit;
        }
        config.build.minify = process.env.MODERN === 'true' ? 'esbuild' : undefined;
        config.build.sourcemap =
            process.env.GENERATE_SOURCEMAP === 'true' ||
            vueConfig.productionSourceMap ||
            css.sourceMap;

        // alias
        const chainableConfig = new Config();
        if (vueConfig.chainWebpack) {
            vueConfig.chainWebpack(chainableConfig);
        }
        const aliasOfChainWebpack = chainableConfig.resolve.alias.entries();
        const aliasOfConfigureWebpackObjectMode =
            vueConfig?.configureWebpack?.resolve?.alias || {};
        const aliasOfConfigureFunctionMode = (() => {
            if(typeof vueConfig.configureWebpack === 'function') {
                let originConfig = chainableConfig.toConfig();
                const res = vueConfig.configureWebpack(originConfig);
                originConfig = merge(originConfig, res);
                if (res) {
                    return res.resolve.alias || {};
                }
                return (originConfig.resolve && originConfig.resolve.alias) || {};
            }
        })();
        const defaultAlias = {};
        defaultAlias['/^~/'] = '';
        defaultAlias['@'] = 'path.resolve(__dirname,\'src\')';
        const alias = {
            ...defaultAlias,
            ...aliasOfConfigureWebpackObjectMode,
            ...aliasOfConfigureFunctionMode,
            ...aliasOfChainWebpack,
        }

        config.resolve = {};
        config.resolve.extensions = [
            '.mjs',
            '.js',
            '.ts',
            '.jsx',
            '.tsx',
            '.json',
            '.vue',
        ];
        config.resolve.alias = [];
        Object.keys(alias).forEach((key) => {
            config.resolve.alias.push({
                find: key,
                replacement: alias[key],
            });
        });
        config = removeUndefined(config);
        return config;
    }

    public useJsx() : boolean {
        try {
            const jsx = require('babel-plugin-transform-vue-jsx');
            if (jsx) {
                return true;
            }
        } catch (error) {} //eslint-disable-line no-empty

        return false;
    }

    public transformVue(context: TransformContext) {
        const plugins: RawValue[] = [];
        if (context.vueVersion === 2) {
            context.importList.push(
                'import { createVuePlugin } from \'vite-plugin-vue2\';'
            );
            if (context.jsx) {
                plugins.push(new RawValue('createVuePlugin({jsx:true})'));
            } else {
                plugins.push(new RawValue('createVuePlugin()'));
            }
        } else {
            context.importList.push('import vue from \'@vitejs/plugin-vue\';');
            plugins.push(new RawValue('vue()'));
            if (context.jsx) {
                context.importList.push('import vueJsx from \'@vitejs/plugin-vue-jsx\';');
                plugins.push(new RawValue('vueJsx()'));
            }
        }

        context.importList.push('import envCompatible from \'vite-plugin-env-compatible\';');
        plugins.push(new RawValue('envCompatible()'));

        context.config.plugins = plugins;
    }
}