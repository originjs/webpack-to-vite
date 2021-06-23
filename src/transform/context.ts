import { ViteConfig } from '../config/vite'

export interface TransformContext {
    vueVersion : number;
    config : ViteConfig;
    importers : string[];
}
