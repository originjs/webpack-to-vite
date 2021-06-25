import { genePackageJson } from '../src/generate/genePackageJson';
import path from 'path';
import fs from 'fs';
import { genIndexHtml } from '../src/generate/geneIndexHtml';
import { readSync } from '../src/utils/file';
import * as constants from '../src/constants/constants';

test('genePackageJson', () => {
  const packageJsonPath = path.resolve('./tests/testdata/generate/package.json');
  genePackageJson(packageJsonPath);
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
  expect(JSON.parse(packageJsonContent).devDependencies['@vue/compiler-sfc']).toEqual(constants.VUE_COMPILER_SFC_VERSION);
  expect(JSON.parse(packageJsonContent).devDependencies.vite).toEqual(constants.VITE_VERSION);
  expect(JSON.parse(packageJsonContent).devDependencies['@vitejs/plugin-vue']).toEqual(constants.VITE_PLUGIN_VUE_VERSION);
});

test('genIndexHtml', () => {
  genIndexHtml('./tests/out');
  const filePath = path.resolve('./tests/out/index.html');
  const content = readSync(filePath);
  expect(content).toContain('src/main.js');
})
