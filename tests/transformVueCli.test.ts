import {VueCliTransformer} from "../src/transform/transformVuecli";
import path from "path";
import {RawValue, ViteConfig} from "../src/config/vite";
import {copyDirSync} from "../src/utils/file";
import fs from "fs";

describe('VueCliTransformer', () => {
    beforeEach(() => {
        const srcPath = path.resolve('tests/testdata/transform-vue-cli')
        const destPath = path.resolve('tests/out-transform-vue-cli')
        copyDirSync(srcPath, destPath)
    })
    afterEach(() => {
        fs.rmdirSync(path.resolve('tests/out-transform-vue-cli'), { recursive: true })
    })
    test('transform', async () => {
        const transformer: VueCliTransformer = new VueCliTransformer()
        const viteConfig: ViteConfig = await transformer.transform(path.resolve('tests/out-transform-vue-cli'))
        expect(viteConfig.base).toBe('/')
        expect(viteConfig.css).toMatchObject({
            preprocessorOptions: {
                sass: {
                    additionalData: '$injectedColor: orange;'
                },
                less: {
                    lessOptions: {},
                    modifyVars: {
                        'vab-color-blue': '#1899ff'
                    }
                },
                scss: {
                    additionalData:
                        '@import "src/styles/_variables.scss";@import "src/styles/_mixins.scss";$injectedColor: orange;'
                }
            }
        })
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
            }
        })
        expect(viteConfig.build).toMatchObject({
            cssCodeSplit: true,
            sourcemap: true
        })
        expect(viteConfig.resolve).toMatchObject({
            alias: [
                {
                    find: /^~/,
                    replacement: ''
                },
                {
                    find: '@',
                    replacement: new RawValue(`path.resolve(__dirname, 'src')`)
                },
                {
                    find: '@components',
                    replacement: new RawValue(`path.resolve(__dirname, 'src/components')`)
                },
                {
                    find: 'assets',
                    replacement: new RawValue(`path.resolve(__dirname, 'src/assets')`)
                },
                {
                    find: '_c',
                    replacement: new RawValue(`path.resolve(__dirname, 'src/components')`)
                }
            ],
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
        })
        expect(viteConfig.plugins).toMatchObject([
            new RawValue('viteCommonjs()'),
            new RawValue('envCompatible()'),
            new RawValue(`createHtmlPlugin({\n` +
              `      minify: {\n` +
              `        minifyJS: true,\n` +
              `        minifyCSS: true,\n` +
              `        useShortDoctype: true,\n` +
              `        collapseWhitespace: true,\n` +
              `        collapseInlineTagWhitespace: true\n` +
              `      },\n` +
              `      inject: {\n` +
              `        tags: [\n` +
              `          {\n` +
              `            tag: 'meta',\n` +
              `            attrs: {\n` +
              `              name: 'description',\n` +
              `              content: 'transform configureWebpack',\n` +
              `              injectTo: 'head'\n` +
              `            }\n` +
              `          }\n` +
              `        ],\n` +
              `        data: {\n` +
              `          title: 'Webpack App',\n` +
              `          favicon: './favicon.ico',\n` +
              `          foo: 'bar'\n` +
              `        }\n` +
              `      }\n` +
              `    })`)
        ])
    })
})
