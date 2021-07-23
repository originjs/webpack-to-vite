import { VueCliTransformer } from '../src/transform/transformVuecli';
import path from 'path';
import { RawValue, ViteConfig } from '../src/config/vite';
import { VueCliConfig } from '../src/config/vuecli';

test('transformer', async () => {
  const configPath = path.resolve('./tests/testdata/vue.config.js');
  const viteConfig = await new VueCliTransformer().transform(path.dirname(configPath));
  expect(viteConfig.base).toEqual('/');
})

describe('transform vue-cli config', () => {
  test('transform vue3', async () => {
    const rootDir = path.resolve('./tests/testdata/transform/vue3')
    const transformer = new VueCliTransformer();
    const viteConfig = await transformer.transform(rootDir);
    expect(viteConfig.plugins).toContainEqual(new RawValue('vue()'));
    expect(viteConfig.plugins).toContainEqual(new RawValue('vueJsx()'));
  });

  test('transform vue2 with jsx', async () => {
    const rootDir = path.resolve('./tests/testdata/transform/vue2');
    const transformer = new VueCliTransformer();
    const viteConfig = await transformer.transform(rootDir);
    expect(viteConfig.plugins).toContainEqual(new RawValue('createVuePlugin({jsx:true})'));
  });

  test('transform devServer', () => {
    const vueConfig: VueCliConfig = {
      devServer: {
        proxy: {
          '/test': {
            target: 'http://www.example.org'
          },
          '/api': {
            pathRewrite: {
              '^/remove/api': ''
            }
          }
        }
      }
    }
    const viteConfig: ViteConfig = {}
    const transformer = new VueCliTransformer();
    viteConfig.server = transformer.transformDevServer(vueConfig.devServer)
    expect(viteConfig).toEqual({
      server: {
        proxy: {
          '/test': {
            target: 'http://www.example.org'
          },
          '/api': {
            rewrite: new RawValue('(path) => path.replace(/^\\/remove\\/api/, \'\')')
          }
        },
        strictPort: false
      }
    });
  });
})
