import fs from 'fs'
import path from 'path'
import { readSync, writeSync } from '../utils/file'
import { isObject } from '../utils/common'
import { Config } from '../config/config'

export function geneIndexHtml (rootDir: string, config: Config): void {
  const baseFilePath = path.resolve(rootDir, 'index.html')
  const vueCliFilePath = path.resolve(rootDir, 'public/index.html')
  let htmlContent
  if (config.projectType !== 'webpack' && fs.existsSync(vueCliFilePath)) {
    htmlContent = readSync(vueCliFilePath).replace(/<%.*URL.*%>/g, '')
  } else if (fs.existsSync(baseFilePath)) {
    htmlContent = readSync(baseFilePath).replace(/<%.*URL.*%>/g, '')
  } else {
    htmlContent = readSync(path.resolve(path.resolve('src/template/index.html')))
  }
  let entries : string[] = []
  if (config.entry !== undefined && config.entry !== '' && config.entry.length !== 0 && config.entry !== {}) {
    entries = getEntries(config.entry)
  } else {
    entries = getDefaultEntries(rootDir)
  }
  const injectedContent = injectHtml(htmlContent, entries)
  writeSync(baseFilePath, injectedContent)
}

export function injectHtml (source: string, entries: string[]): string {
  const bodyRegex = /<body[^>]*>((.|[\n\r])*)<\/body>/im
  let body = '<body>\n'
  body += '  <div id="app"></div>\n'
  for (const entry of entries) {
    if (entry !== undefined) {
      body += `  <script type="module" src="${entry}"></script>\n`
    }
  }
  body += '</body>'
  const result = source.replace(bodyRegex, body)
  return result
}

function getDefaultEntries (rootDir: string): string[] {
  const entries: string[] = []
  let mainFile = path.resolve(rootDir, 'src/main.ts')
  if (fs.existsSync(mainFile)) {
    entries.push('/src/main.ts')
    return entries
  }
  mainFile = path.resolve(rootDir, 'src/main.js')
  if (fs.existsSync(mainFile)) {
    entries.push('/src/main.js')
    return entries
  }
  // TODO: vue-cli pages config
  return entries
}

function getEntries (entry: any) : string[] {
  const entries: string[] = []
  if (entry === undefined) {
    return entries
  }
  if (isObject(entry)) {
    Object.keys(entry).forEach(function (name) {
      entries.push(entry[name])
    })
  }
  if (typeof entry === 'function') {
    entries.push(entry())
  }
  if (typeof entry === 'string') {
    entries.push(entry)
  }

  // vite support hmr by default, so do not need to import webpack-hot-middleware
  entries.forEach((item, index) => {
    if (item.indexOf('dev-client') !== -1) {
      delete (entries[index])
    }
  })
  return entries
}
