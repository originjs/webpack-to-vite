import path from 'path';
import { geneIndexHtml } from '../src/generate/geneIndexHtml';
import { readSync, removeSync } from '../src/utils/file';
import { Config } from '../src/config/config'

test('geneIndexHtml', async () => {
  const config : Config = {
    projectType: 'vue-cli'
  }
  await geneIndexHtml(path.resolve('./tests/out'), config);
  const filePath = path.resolve('./tests/out/index.html');
  const content = readSync(filePath);
  removeSync(filePath);
  expect(content).toContain('<div id="app"></div>');
})
