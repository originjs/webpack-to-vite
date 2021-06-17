import { TransformContext } from './context'
import { ViteConfig } from '../config/vite'
/**
 * general implementation for vue.config.js and webpack.config.js
 *
 */
export interface Transformer{
    context: TransformContext;

    transform(rootDir: string): Promise<ViteConfig>;

}
