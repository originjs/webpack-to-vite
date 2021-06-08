import { VueCliTransformer } from "../src/transform/transformVuecli";
import path from 'path';
import {RawValue} from "../src/config/vite";

test('transformer', async() => {
    const configPath = path.resolve('./tests/testdata/vue.config.js');
    const viteConfig = await new VueCliTransformer().transform(path.dirname(configPath));
    expect(viteConfig.base).toEqual('/');
})

describe('transform vue-cli config', () => {

    test('transform vue3', async () => {
        const rootDir = path.resolve('./tests/testdata/transform/vue3')
        const transformer = new VueCliTransformer();
        transformer.context.jsx = true;
        const viteConfig = await transformer.transform(rootDir);
        expect(viteConfig.plugins).toContainEqual(new RawValue('vue()'));
        expect(viteConfig.plugins).toContainEqual(new RawValue('vueJsx()'));
    });

    test('transform vue2 with jsx', async() => {
       const rootDir = path.resolve('./tests/testdata/transform/vue2');
       const transformer = new VueCliTransformer();
       transformer.context.jsx = true;
       const viteConfig = await transformer.transform(rootDir);
       expect(viteConfig.plugins).toContainEqual(new RawValue('createVuePlugin({jsx:true})'));
    });
})
