import { ViteConfig } from '../config/vite'

export interface TransformContext {
    vueVersion : number | undefined;
    config : ViteConfig;
    importers : string[];
}
