import path from 'path';
import fs from 'fs';
import * as constants from '../src/constants/constants';
import {genePackageJson, getGreaterVersion, processDependencies} from '../src/generate/genePackageJson';
import { geneIndexHtml } from '../src/generate/geneIndexHtml';
import { readSync } from '../src/utils/file';
import { Config } from '../src/config/config'

test('genePackageJson', () => {
  const packageJsonPath = path.resolve('./tests/testdata/generate/package.json');
  genePackageJson(packageJsonPath);
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
  expect(JSON.parse(packageJsonContent).devDependencies['@vue/compiler-sfc']).toEqual(constants.VUE_COMPILER_SFC_VERSION);
  expect(JSON.parse(packageJsonContent).devDependencies.vite).toEqual(constants.VITE_VERSION);
  expect(JSON.parse(packageJsonContent).devDependencies['@vitejs/plugin-vue']).toEqual(constants.VITE_PLUGIN_VUE_VERSION);
});

test('getGreaterVersion', () => {
  expect(getGreaterVersion('0.0.1', '0.0.0')).toEqual('0.0.1')
  expect(getGreaterVersion('0.0.1', '^0.0.0')).toEqual('0.0.1')
  expect(getGreaterVersion('^0.0.1', '^0.0.0')).toEqual('^0.0.1')
  expect(getGreaterVersion('<0.0.1', '>0.0.1')).toEqual('>0.0.1')
})

test('processDependencies', () => {
  type PackageJson = {
    dependencies?: object,
    devDependencies?: object
  }

  const originPackageJsonA: PackageJson = {
    dependencies: {
      sass: '^1.1.1'
    }
  }
  const packageJsonA: PackageJson = {
    dependencies: {
      sass: '^1.1.1'
    },
    devDependencies: {
      sass: '0.1.1'
    }
  }
  const resultA = processDependencies(originPackageJsonA.dependencies, packageJsonA.dependencies, packageJsonA.devDependencies)
  expect(resultA).toEqual({
    targetDependencies: {
      sass: '^1.1.1'
    },
    restDependencies: {}
  })

  const originPackageJsonB: PackageJson = {
    dependencies: {
      sass: '^1.1.1'
    }
  }
  const packageJsonB: PackageJson = {
    dependencies: {
      sass: '0.1.1'
    }
  }
  const resultB = processDependencies(originPackageJsonB.dependencies, packageJsonB.dependencies, packageJsonB.devDependencies)
  expect(resultB).toEqual({
    targetDependencies: {
      sass: '^1.1.1'
    }
  })
})

test('geneIndexHtml', () => {
  const config : Config = {
    projectType: 'vue-cli'
  }
  geneIndexHtml(path.resolve('./tests/out'), config);
  const filePath = path.resolve('./tests/out/index.html');
  const content = readSync(filePath);
  expect(content).toContain('<div id="app"></div>');

})
