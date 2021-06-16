import { ViteConfig } from '../config/vite';

export interface TransformContext {
    vueVersion : number;
    jsx : boolean;
    config : ViteConfig;
    importList : string[];
}