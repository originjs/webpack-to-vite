import path from 'path'
import { readSync } from './file'
import { DEFAULT_VUE_VERSION } from '../constants/constants'
import fs from 'fs'

export function getVueVersion (rootDir: string): number {
  const vueVersion = DEFAULT_VUE_VERSION
  const jsonPath = path.resolve(rootDir, 'package.json')
  if (!fs.existsSync(jsonPath)) {
    return vueVersion
  }
  let source = readSync(jsonPath)
  let jsonObj = JSON.parse(source)
  if (jsonObj === '') {
    return vueVersion
  }
  const dep = getVueDependency(jsonObj)
  if (dep.vue === undefined) {
    const nodePath = path.resolve(rootDir, 'node_modules/vue/package.json')
    if (!fs.existsSync(nodePath)) {
      return vueVersion
    }
    source = readSync(nodePath)
    jsonObj = JSON.parse(source)
    if (jsonObj === '' || dep.vue === undefined) {
      return vueVersion
    }
    return Number(jsonObj.version.replace(/~|\^/, '').split('.')[0])
  }
  return Number(dep.vue.replace(/~|\^/, '').split('.')[0])
}

function getVueDependency (jsonObj: any) : any {
  const deps = jsonObj.dependencies !== undefined ? jsonObj.dependencies : jsonObj.devDependencies
  return deps
}
