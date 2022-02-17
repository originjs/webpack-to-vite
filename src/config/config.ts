import type { HtmlTagDescriptor } from 'vite'
import type { Options as Options$1 } from 'ejs';
import type { importer } from '../transform/context'

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

// export from vite-plugin-html
export interface InjectOptions {
    /**
     * @description Data injected into the html template
     * @deprecated Has been replaced by `data`
     */
    injectData?: Record<string, any>;
    /**
     *  @description Data injected into the html template
     */
    data?: Record<string, any>;
    /**
     * @description esj options configuration
     * @deprecated Has been replaced by `options`
     */
    injectOptions?: Options$1;
    /**
     * @description esj options configuration
     */
    ejsOptions?: Options$1;
    /**
     * @description vite transform tags
     */
    tags?: HtmlTagDescriptor[];
}
