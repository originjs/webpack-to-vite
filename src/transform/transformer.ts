import { TransformContext } from './context';
import { RawValue, ViteConfig } from '../config/vite';
/**
 * general implementation for vue.config.js and webpack.config.js
 * 
 */
export interface Transformer{
    context: TransformContext;

    transform(rootDir: string): Promise<ViteConfig>;

}

export function initViteConfig() : ViteConfig {
    const config : ViteConfig = {}

    const defaultAlias = []
    defaultAlias.push({ find: new RawValue('/^~/'), replacement: ''});
    defaultAlias.push({ find: '', replacement: new RawValue('path.resolve(__dirname,\'src\')')});

    config.resolve = {};
    config.resolve.alias = defaultAlias;
    config.resolve.extensions = [
        '.mjs',
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue',
    ];

    return config;

}

export function useJsx() : boolean {
    try {
        const jsx = require('babel-plugin-transform-vue-jsx');
        if (jsx) {
            return true;
        }
    } catch (error) {} //eslint-disable-line no-empty

    return false;
}
