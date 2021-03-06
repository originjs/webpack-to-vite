import type { HtmlTagDescriptor } from 'vite'
import type { Options as EJSOptions } from 'ejs';
import type { Options as MinifyOptions } from 'html-minifier-terser';
import type { importer } from '../transform/context'

export interface Config {
    rootDir?: string;
    projectType?: string;
    entry?: any;
    cover?: boolean;
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

// export from 'vite-plugin-html'
// Copyright (c) 2020-present, Vben
// MIT License applied: https://github.com/vbenjs/vite-plugin-html/blob/main/LICENSE
export interface InjectOptions {
    /**
     *  @description Data injected into the html template
     */
    data?: Record<string, any>;
    tags?: HtmlTagDescriptor[];
    /**
     * @description esj options configuration
     */
    ejsOptions?: EJSOptions;
}

export interface PageOption {
    filename: string;
    template: string;
    entry?: string;
    injectOptions?: InjectOptions;
}

export declare type Pages = PageOption[];

export interface UserOptions {
    /**
     * @description Page options
     */
    pages?: Pages;
    /**
     * @description Minimize options
     */
    minify?: MinifyOptions | boolean;
    /**
     * page entry
     */
    entry?: string;
    /**
     * template path
     */
    template?: string;
    /**
     * @description inject options
     */
    inject?: InjectOptions;
    /**
     * output warning log
     * @default false
     */
    verbose?: boolean;
}
