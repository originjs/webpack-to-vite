import { readSync, writeSync } from '../utils/file'
import { getVueVersion } from '../utils/version'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import * as constants from '../constants/constants'
import { recordConver } from '../utils/report'
import { minVersion, gt } from 'semver'

// TODO: compatible with vue2 and vue3
export function genePackageJson (packageJsonPath: string): void {
  const rootDir = path.dirname(packageJsonPath)
  const source = readSync(packageJsonPath)
  if (source === '') {
    console.log(chalk.red(`read package.json error, path: ${rootDir}`))
  }

  const originPackageJson = JSON.parse(source)
  const packageJson = JSON.parse(source)
  if (packageJson === '') {
    console.log(chalk.red(`parse json error, path: ${rootDir}`))
  }

  const vueVersion = getVueVersion(rootDir)
  if (vueVersion === 3) {
    packageJson.devDependencies['@vue/compiler-sfc'] = constants.VUE_COMPILER_SFC_VERSION
    packageJson.devDependencies['@vitejs/plugin-vue'] = constants.VITE_PLUGIN_VUE_VERSION
    packageJson.devDependencies['@vitejs/plugin-vue-jsx'] = constants.VITE_PLUGIN_VUE_JSX_VERSION
  } else if (vueVersion === 2) {
    packageJson.devDependencies['vite-plugin-vue2'] = constants.VITE_PLUGIN_VUE_TWO_VERSION
  }

  packageJson.devDependencies['vite-plugin-env-compatible'] = constants.VITE_PLUGIN_ENV_COMPATIBLE
  packageJson.devDependencies.vite = constants.VITE_VERSION
  // TODO scan files to determine whether you need to add the plugin
  packageJson.devDependencies['@originjs/vite-plugin-commonjs'] = constants.VITE_PLUGIN_COMMONJS_VERSION

  // sass support
  if (packageJson.devDependencies['node-sass'] && !packageJson.devDependencies.sass) {
    packageJson.devDependencies.sass = constants.SASS_VERSION
  }

  // postcss 8 support
  const postcssConfig = path.resolve(rootDir, 'postcss.config.js')
  if (fs.existsSync(postcssConfig)) {
    packageJson.dependencies.postcss = constants.POSTCSS_VERSION
  }

  // patch-package support
  packageJson.devDependencies['patch-package'] = constants.PATCH_PACKAGE_VERSION

  // add vite dev script
  packageJson.scripts['serve-vite'] = 'vite'
  packageJson.scripts['build-vite'] = 'vite build'

  // add postinatall
  packageJson.scripts.postinstall = 'patch-package'

  let result = processDependencies(originPackageJson.dependencies, packageJson.dependencies, packageJson.devDependencies)
  packageJson.dependencies = result.targetDependencies
  packageJson.devDependencies = result.restDependencies

  result = processDependencies(originPackageJson.devDependencies, packageJson.devDependencies, packageJson.dependencies)
  packageJson.dependencies = result.restDependencies
  packageJson.devDependencies = result.targetDependencies

  writeSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  recordConver({ num: 'B01', feat: 'add package.json' })
}

export function getGreaterVersion (versionA: string, versionB: string): string {
  // only compare minimal version because it is hard to compare semantic version
  const minVersionA = minVersion(versionA).version
  const minVersionB = minVersion(versionB).version
  return gt(minVersionA, minVersionB) ? versionA : versionB
}

// save greatest dependency version to targetDependencies and remove duplicate dependency from restDependencies
export function processDependencies (
  originDependencies: object,
  targetDependencies: object,
  restDependencies: object
): {
  targetDependencies: object,
  restDependencies: object
} {
  originDependencies && Object.keys(originDependencies).forEach(key => {
    if (targetDependencies && originDependencies[key] !== targetDependencies[key]) {
      targetDependencies[key] = getGreaterVersion(originDependencies[key], targetDependencies[key])
    }
    if (restDependencies && restDependencies[key]) {
      if (restDependencies[key] !== targetDependencies[key]) {
        targetDependencies[key] = getGreaterVersion(restDependencies[key], targetDependencies[key])
      }
      delete restDependencies[key]
    }
  })
  return {
    targetDependencies,
    restDependencies
  }
}
