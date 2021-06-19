export interface Config {
    rootDir?: string;
    type?: string;
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
    IMPORT_LIST: string[];
    USER_CONFIG: string;
}
