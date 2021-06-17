import { Config, DevServer } from './config';

export interface VueCliConfig extends Config {
    baseUrl?: string;
    publicPath?: string;
    outputDir?: string;
    assetsDir?: string;
    indexPath?: string;
    filenameHashing?: boolean;
    pages?: Record<string, any>;
    lintOnSave?: string;
    runtimeCompiler?: boolean;
    transpileDependencies?: [];
    productionSourceMap?: boolean;
    crossorigin?: string;
    integrity?: boolean;
    configureWebpack?: any;
    // eslint-disable-next-line @typescript-eslint/ban-types
    chainWebpack?: Function;
    css?: {
        sourceMap?: boolean;
        loaderOptions?: Record<string, any>;
        extract?: any;
    };
    devServer?: DevServer;
    parallel?: boolean;
    pwa?: Record<string, never>;
    pluginOptions?: Record<string, any>;
}
