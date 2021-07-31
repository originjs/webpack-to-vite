import path from "path";
import {RawValue, ViteConfig} from "../src/config/vite";
import {copyDir} from "../src/utils/file";
import {WebpackTransformer} from "../src/transform/transformWebpack";
import * as fs from "fs";

describe('WebpackTransformer', () => {
    beforeEach(() => {
        const srcPath = path.resolve('tests/testdata/transform-webpack')
        const destPath = path.resolve('tests/out')
        copyDir(srcPath, destPath)
    })
    afterEach(() => {
        fs.rmdirSync(path.resolve('tests/out'), { recursive: true })
    })
    test('transform', async () => {
        const transformer: WebpackTransformer = new WebpackTransformer()
        const viteConfig: ViteConfig = await transformer.transform(path.resolve('tests/out'))
        expect(viteConfig.mode).toBe('development')
        expect(viteConfig.build.rollupOptions.input).toMatchObject({
            app: new RawValue(`path.resolve(__dirname, 'build/src/app.js')`)
        })
        expect(viteConfig.build.outDir).toEqual(new RawValue(`path.resolve(__dirname, 'build/dist')`))
        expect(viteConfig.resolve.alias).toMatchObject([
            {
                find: '@',
                replacement: new RawValue(`path.resolve(__dirname,'src')`)
            }
        ])
        expect(viteConfig.server).toMatchObject({
            strictPort: false,
            port: 5000,
            host: 'www.example.com',
            open: true,
            https: true,
            proxy: {
                '/api': {
                    target: 'http://localhost:8888',
                    changeOrigin: true,
                    rewrite: new RawValue(`(path) => path.replace(/^\\/api/, '')`)
                }
            },
            base: new RawValue(`path.resolve(__dirname, 'build/src')`)
        })
        expect(viteConfig.define).toMatchObject({
            'process.env': {
                NODE_ENV: '"development"'
            }
        })
    })
})
