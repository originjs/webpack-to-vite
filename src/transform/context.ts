import type { ViteConfig } from '../config/vite'

export interface importer {
    key: string;
    value: string;
}

export interface TransformContext {
    vueVersion : number | undefined;
    config : ViteConfig;
    importers : importer[];
}
