import {getTransformer, initViteConfig, transformImporters} from "../src/transform/transformer";
import {RawValue, ViteConfig} from "../src/config/vite";
import {VueCliTransformer} from "../src/transform/transformVuecli";
import {WebpackTransformer} from "../src/transform/transformWebpack";
import {TransformContext} from "../src/transform/context";

test('initViteConfig', () => {
    const result: ViteConfig = initViteConfig()

    expect(result.resolve).toMatchObject(expect.objectContaining({
        alias: [
            { find: new RawValue('/^~/'), replacement: '' },
            { find: '', replacement: new RawValue('path.resolve(__dirname,\'src\')') }
        ],
        extensions: [
            '.mjs',
            '.js',
            '.ts',
            '.jsx',
            '.tsx',
            '.json',
            '.vue'
        ]
    }))
})

test('getTransformer', () => {
    const resultA = getTransformer(null)
    expect(resultA).toEqual(expect.any(VueCliTransformer))

    const resultB = getTransformer('vue-cli')
    expect(resultB).toEqual(expect.any(VueCliTransformer))

    const resultC = getTransformer('webpack')
    expect(resultC).toEqual(expect.any(WebpackTransformer))
})

test('transformImports', () => {
    let context: TransformContext = {
        vueVersion: null,
        importers: [],
        config: {
            plugins: []
        }
    }
    transformImporters(context)
    expect(context).toEqual(expect.objectContaining({
        importers: [
            'import envCompatible from \'vite-plugin-env-compatible\';',
            'import { injectHtml } from \'vite-plugin-html\';',
            'import { viteCommonjs } from \'@originjs/vite-plugin-commonjs\';'
        ],
        config: {
            plugins: [
                new RawValue('viteCommonjs()'),
                new RawValue('envCompatible()'),
                new RawValue('injectHtml()')
            ]
        }
    }))

    let contextVue2: TransformContext = {
        vueVersion: 2,
        importers: [],
        config: {
            plugins: []
        }
    }
    transformImporters(contextVue2)
    expect(contextVue2).toEqual(expect.objectContaining({
        importers: expect.arrayContaining([
            'import { createVuePlugin } from \'vite-plugin-vue2\';'
        ]),
        config: {
            plugins: expect.arrayContaining([
                new RawValue('createVuePlugin({ jsx: true })')
            ])
        }
    }))

    let contextVue3: TransformContext = {
        vueVersion: 3,
        importers: [],
        config: {
            plugins: []
        }
    }
    transformImporters(contextVue3)
    expect(contextVue3).toEqual(expect.objectContaining({
        importers: expect.arrayContaining([
            'import vue from \'@vitejs/plugin-vue\';',
            'import vueJsx from \'@vitejs/plugin-vue-jsx\';'
        ]),
        config: {
            plugins: expect.arrayContaining([
                new RawValue('vue()'),
                new RawValue('vueJsx()')
            ])
        }
    }))
})
