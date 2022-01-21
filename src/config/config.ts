import type { importer } from '../transform/context';

export interface Config {
    rootDir?: string;
    projectType?: string;
    entry?: any;
}

export interface DevServer {
    contentBase?: string;
    https?: boolean;
    host?: string;
    open?: boolean;
    port?: number;
    proxy?: any;
    public?: string;
}

export interface TemplateData {
    IMPORT_LIST: importer[];
    USER_CONFIG: string;
}
