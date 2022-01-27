import type { Config, DevServer } from './config'

export interface Output {
    path?: string;
    filename?: string;
    publicPath?: string;
    chunkFilename?: string
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

export type Entry = string | string[] | { [entryAlias: string]: string } | any;

export interface WebpackConfig extends Config {
    mode?: string;
    context?: string;
    entry?: Entry;
    output?: Output;
    module?: Module;
    resolve?: Resolve;
    devServer?: DevServer;
    plugins?: [];
}
