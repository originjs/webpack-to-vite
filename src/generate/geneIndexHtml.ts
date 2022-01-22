import fs, { existsSync } from 'fs'
import path from 'path'
import { readSync, writeSync, relativePathFormat } from '../utils/file'
import { isObject, stringFormat } from '../utils/common'
import type { Config } from '../config/config'
import type { AstParsingResult } from '../ast-parse/astParse'
import { TRANSFORMATION_TYPES } from '../constants/constants'
import { recordConver } from '../utils/report'
import { parseVueCliConfig, parseWebpackConfig } from '../config/parse'

export async function geneIndexHtml (
  rootDir: string,
  config: Config,
  astParsingResult?: AstParsingResult
): Promise<void> {
  const outputIndexPath: string = path.resolve(rootDir, 'index.html')
  const projectType: string = config.projectType

  let entries: Map<string, string[]> = new Map()
  // `config.entry` can be type of string | array | object | function
  if (
    config.entry &&
    (config.entry.length ||
      Object.keys(config.entry).length ||
      typeof config.entry === 'function')
  ) {
    entries = getEntries(rootDir, config.entry)
  } else {
    entries = await getDefaultEntries(rootDir, projectType)
  }

  const injectedContent = generateWithVueCliPublicIndex(
    astParsingResult,
    entries,
    projectType
  )
  writeSync(outputIndexPath, injectedContent)
  recordConver({ num: 'B02', feat: 'add index.html' })
}

export function generateHtmlWithEntries (entries: Map<string, string[]>): string {
  let htmlWithEntries: string = ''
  entries.forEach((value, key) => {
    if (key === 'app') {
      value.forEach(entryPath => {
        htmlWithEntries += `  <script type="module" src="${entryPath}"></script>\n`
      })
      return false
    }
    return true
  })
  return htmlWithEntries
}

export function generateWithVueCliPublicIndex (
  astParsingResult: AstParsingResult,
  entries: Map<string, string[]>,
  projectType: string
): string {
  let indexHtmlTransformationResult

  if (!astParsingResult) {
    indexHtmlTransformationResult = null
  } else if (projectType === 'webpack') {
    indexHtmlTransformationResult =
      astParsingResult.transformationResult[
        TRANSFORMATION_TYPES.indexHtmlTransformationWebpack
      ]
  } else {
    indexHtmlTransformationResult =
      astParsingResult.transformationResult[
        TRANSFORMATION_TYPES.indexHtmlTransformationVueCli
      ]
  }

  let indexHtmlContent: string
  if (indexHtmlTransformationResult) {
    indexHtmlContent = indexHtmlTransformationResult[0].content
  } else {
    indexHtmlContent = readSync(path.join(__dirname, '../template/index.html'))
  }
  return stringFormat(indexHtmlContent, generateHtmlWithEntries(entries))
}

export async function getDefaultEntries (
  rootDir: string,
  projectType: string
): Promise<Map<string, string[]>> {
  let entries: Map<string, string[]> = new Map()

  // config entries
  if (projectType === 'webpack' && existsSync(path.resolve(rootDir, 'webpack.config.js'))) {
    const webpackConfig = await parseWebpackConfig(path.resolve(rootDir, 'webpack.config.js'))
    const webpackEntries = webpackConfig.entry
    if (webpackEntries) {
      entries = getEntries(rootDir, webpackEntries, webpackConfig.context)
    }
  } else if (existsSync(path.resolve(rootDir, 'vue.config.js'))) {
    const vueConfig = await parseVueCliConfig(path.resolve(rootDir, 'vue.config.js'))
    const vueEntries = vueConfig.pages
    if (vueEntries) {
      entries = getEntries(rootDir, vueEntries)
    }
  }

  // default
  if (!entries.size) {
    if (fs.existsSync(path.resolve(rootDir, 'src/main.ts'))) {
      entries.set('app', ['/src/main.ts'])
    } else if (fs.existsSync(path.resolve(rootDir, 'src/main.js'))) {
      entries.set('app', ['/src/main.js'])
    }
  }

  return entries
}

export function getEntries (rootDir: string, rawEntry: any, context?: string): Map<string, string[]> {
  let entries: Map<string, string[]> = new Map()
  if (rawEntry === undefined) {
    return entries
  }
  if (isObject(rawEntry)) {
    Object.keys(rawEntry).forEach(name => {
      const entry = isObject(rawEntry[name])
        ? rawEntry[name].import || rawEntry[name].entry
        : rawEntry[name]
      entries.set(name, getEntries(rootDir, entry, context).get('app'))
    })
  } else if (Array.isArray(rawEntry)) {
    entries.set('app', rawEntry.map(entry => context ? relativePathFormat(rootDir, path.join(context, entry)) : relativePathFormat(rootDir, entry)))
  } else if (typeof rawEntry === 'function') {
    const entriesGettedByFunction = rawEntry()
    entries = getEntries(rootDir, entriesGettedByFunction, context)
  } else if (typeof rawEntry === 'string') {
    const entryPath = context
      ? relativePathFormat(rootDir, path.join(context, rawEntry))
      : relativePathFormat(rootDir, rawEntry)
    entries.set('app', [entryPath])
  }

  // vite support hmr by default, so do not need to import webpack-hot-middleware
  entries.forEach((value, key) => {
    entries.set(key, value.filter((item) => !item.includes('dev-client')))
  })
  return entries
}
