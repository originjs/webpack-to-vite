import { Config, DevServer } from "./config";

export interface WebpackConfig extends Config {
    mode?: string;
    entry?: string;
    output?: Output;
    module?: Module;
    resolve?: Resolve;
    devServer?: DevServer;
}

export interface Output {
    path?: string;
    filename?: string;
    publicPath?: string;
}

export interface Module {
    rules: Rule[];
}

export interface Rule {
    test: RegExp;
    include?: [];
    exclude?: [];
    loader: string;
}

export interface Resolve {
    modules: [];
    extensions?: [];
    alias: Record<string, never>;
}
