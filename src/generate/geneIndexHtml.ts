import fs from 'fs'
import path from 'path'
import { readSync, writeSync } from '../utils/file'
import { isObject, stringFormat } from '../utils/common'
import { Config } from '../config/config'
import { AstParsingResult } from '../ast-parse/astParse';
import { TransformationType } from '../ast-parse/transformations';

export function geneIndexHtml (rootDir: string, config: Config, astParsingResult: AstParsingResult): void {
  const rootIndexPath = path.resolve(rootDir, 'index.html')
  let entries : string[] = []
  if (config.entry !== undefined && config.entry !== '' && config.entry.length !== 0 && config.entry !== {}) {
    entries = getEntries(config.entry)
  } else {
    entries = getDefaultEntries(rootDir)
  }

  const injectedContent = generateWithVueCliPublicIndex(astParsingResult, entries)
  writeSync(rootIndexPath, injectedContent)
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

export function generateWithVueCliPublicIndex (astParsingResult: AstParsingResult, entries: string[]): string {
  const indexHtmlTransformationResult = astParsingResult.transformationResult[TransformationType.indexHtmlTransformation]
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
