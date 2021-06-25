import { Config, DevServer } from './config'

export interface Output {
    path?: string;
    filename?: string;
    publicPath?: string;
}

export interface Rule {
    test: RegExp;
    include?: [];
    exclude?: [];
    loader: string;
}

export interface Module {
    rules: Rule[];
}

export interface Resolve {
    modules: [];
    extensions?: [];
    alias: Record<string, never>;
}

export interface WebpackConfig extends Config {
    mode?: string;
    entry?: string | string[] | { [entryAlias: string]: string };
    output?: Output;
    module?: Module;
    resolve?: Resolve;
    devServer?: DevServer;
}
