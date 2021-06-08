import { readSync, writeSync } from '../utils/file'
import { getVueVersion } from '../utils/version'
import path from 'path'
import * as constants from '../constants/constants'

// TODO: compatible with vue2 and vue3
export function genePackageJson(packageJsonPath: string): void {
  const rootDir = path.dirname(packageJsonPath)
  const source = readSync(packageJsonPath)
  if (source === '') {
    console.log(`read package.json error, path: ${rootDir}`)
  }

  const packageJson = JSON.parse(source)
  if (packageJson === '') {
    console.log(`parse json error, path: ${rootDir}`)
  }

  const vueVersion = getVueVersion(rootDir)
  if (vueVersion === 3) {
    packageJson.devDependencies['@vue/compiler-sfc'] = constants.VUE_COMPILER_SFC_VERSION
    packageJson.devDependencies['@vitejs/plugin-vue'] = constants.VITE_PLUGIN_VUE_VERSION
  } else if (vueVersion === 2) {
    packageJson.devDependencies['vite-plugin-vue2'] = constants.VITE_PLUGIN_VUE_TWO_VERSION
  }

  packageJson.devDependencies['vite-plugin-env-compatible'] = constants.VITE_PLUGIN_ENV_COMPATIBLE
  packageJson.devDependencies['vite'] = constants.VITE_VERSION

  // sass support
  if (packageJson.devDependencies['node-sass'] && !packageJson.devDependencies['sass']) {
    packageJson.devDependencies['sass'] = constants.SASS_VERSION
  }

  // add vite dev script
  packageJson.scripts['serve-vite'] = 'vite'
  packageJson.scripts['build-vite'] = 'build vite'

  writeSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}