import fs from 'fs'
import path from 'path'
import { readSync, writeSync, relativePathFormat } from '../utils/file'
import { isObject, stringFormat } from '../utils/common'
import { Config } from '../config/config'
import { AstParsingResult } from '../ast-parse/astParse'
import { TransformationType } from '../ast-parse/transformations'
import { recordConver } from '../utils/report'

export function geneIndexHtml (rootDir: string, config: Config, astParsingResult?: AstParsingResult): void {
  const outputIndexPath: string = path.resolve(rootDir, 'index.html')
  const projectType: string = config.projectType

  let entries : string[] = []
  if (config.entry !== undefined && config.entry !== '' && config.entry.length !== 0 && JSON.stringify(config.entry) !== '{}') {
    entries = getEntries(rootDir, config.entry)
  } else {
    entries = getDefaultEntries(rootDir)
  }

  const injectedContent = generateWithVueCliPublicIndex(astParsingResult, entries, projectType)
  writeSync(outputIndexPath, injectedContent)
  recordConver({ num: 'B02', feat: 'add index.html' })
}

function generateEntriesHtml (entries: string[]): string {
  let entriesHtml: string = ''
  for (const entry of entries) {
    if (entry !== undefined) {
      entriesHtml += `  <script type="module" src="${entry}"></script>\n`
    }
  }

  return entriesHtml
}

export function generateWithVueCliPublicIndex (astParsingResult: AstParsingResult, entries: string[], projectType: string): string {
  let indexHtmlTransformationResult

  if (!astParsingResult) {
    indexHtmlTransformationResult = null
  } else if (projectType === 'webpack') {
    indexHtmlTransformationResult = astParsingResult.transformationResult[TransformationType.indexHtmlTransformationWebpack]
  } else {
    indexHtmlTransformationResult = astParsingResult.transformationResult[TransformationType.indexHtmlTransformationVueCli]
  }

  if (indexHtmlTransformationResult) {
    const indexHtmlContent: string = indexHtmlTransformationResult[0].content
    return stringFormat(indexHtmlContent, generateEntriesHtml(entries))
  } else {
    return readSync(path.resolve('src/template/index.html'))
  }
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

function getEntries (rootDir: string, entry: any) : string[] {
  const entries: string[] = []
  if (entry === undefined) {
    return entries
  }
  if (isObject(entry)) {
    Object.keys(entry).forEach(function (name) {
      entries.push(relativePathFormat(rootDir, entry[name]))
    })
  }
  if (typeof entry === 'function') {
    entries.push(entry())
  }
  if (typeof entry === 'string') {
    entries.push(relativePathFormat(rootDir, entry))
  }

  // vite support hmr by default, so do not need to import webpack-hot-middleware
  entries.forEach((item, index) => {
    if (item.indexOf('dev-client') !== -1) {
      delete (entries[index])
    }
  })
  return entries
}
