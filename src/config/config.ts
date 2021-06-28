import vite from 'vite';

export interface Config {
    rootDir?: string;
    projectType?: string;
}

export interface DevServer {
    contentBase?: string;
    https?: boolean;
    host?: string;
    open?: boolean;
    port?: number;
    proxy?: Record<string, string | vite.ProxyOptions>;
    public?: string;
}

export interface TemplateData {
    IMPORT_LIST: string[];
    USER_CONFIG: string;
}
