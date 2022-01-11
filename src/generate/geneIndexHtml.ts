import fs from 'fs'
import path from 'path'
import { readSync, writeSync, relativePathFormat } from '../utils/file'
import { isObject, stringFormat } from '../utils/common'
import type { Config } from '../config/config'
import type { AstParsingResult } from '../ast-parse/astParse'
import { TRANSFORMATION_TYPES } from '../constants/constants'
import { recordConver } from '../utils/report'
import { parseVueCliConfig } from '../config/parse'

export async function geneIndexHtml (
  rootDir: string,
  config: Config,
  astParsingResult?: AstParsingResult
): Promise<void> {
  const outputIndexPath: string = path.resolve(rootDir, 'index.html')
  const projectType: string = config.projectType

  let entries: string[] = []
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

export function generateEntriesHtml (entries: string[]): string {
  let entriesHtml: string = ''
  for (const entry of entries) {
    if (entry !== undefined) {
      entriesHtml += `  <script type="module" src="${entry}"></script>\n`
    }
  }

  return entriesHtml
}

export function generateWithVueCliPublicIndex (
  astParsingResult: AstParsingResult,
  entries: string[],
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
  return stringFormat(indexHtmlContent, generateEntriesHtml(entries))
}

export async function getDefaultEntries (
  rootDir: string,
  projectType: string
): Promise<string[]> {
  const entries: string[] = []
  // TODO: vue-cli pages config
  if (projectType !== 'webpack') {
    const vueConfigFile = path.resolve(rootDir, 'vue.config.js')
    const vueConfig = await parseVueCliConfig(vueConfigFile)
    const entryConfig = vueConfig.pages
    if (entryConfig) {
      Object.keys(entryConfig).forEach((key) => {
        const entryPath: string =
          Object.prototype.toString.call(entryConfig[key]) === '[object String]'
            ? relativePathFormat(rootDir, entryConfig[key])
            : relativePathFormat(rootDir, entryConfig[key].entry)
        entries.push(entryPath)
      })
    }
  }
  let mainFile = path.resolve(rootDir, 'src/main.ts')
  if (fs.existsSync(mainFile)) {
    if (!entries.some((entryPath) => entryPath === 'src/main.ts')) {
      entries.push('/src/main.ts')
    }
    return entries
  }
  mainFile = path.resolve(rootDir, 'src/main.js')
  if (fs.existsSync(mainFile)) {
    if (!entries.some((entryPath) => entryPath === 'src/main.js')) {
      entries.push('/src/main.js')
    }
    return entries
  }
  return entries
}

export function getEntries (rootDir: string, entry: any): string[] {
  let entries: string[] = []
  if (entry === undefined) {
    return entries
  }
  if (isObject(entry) || Array.isArray(entry)) {
    Object.keys(entry).forEach(function (name) {
      if (typeof entry[name] === 'string') {
        entries.push(relativePathFormat(rootDir, entry[name]))
      } else {
        const deepEntries = getEntries(rootDir, entry[name])
        entries = entries.concat(deepEntries)
      }
    })
  }
  if (typeof entry === 'function') {
    entries.push(entry())
  }
  if (typeof entry === 'string') {
    entries.push(relativePathFormat(rootDir, entry))
  }

  // vite support hmr by default, so do not need to import webpack-hot-middleware
  entries = entries.filter((item) => !item.includes('dev-client'))
  return entries
}
