import { transformationMap } from './transformations/index'
import { parsersMap } from './parsers/index'
import { SFCDescriptor, vueSfcAstParser } from '@originjs/vue-sfc-ast-parser'
import * as globby from 'globby'
import fs from 'fs'
import { JSCodeshift } from 'jscodeshift/src/core';
import { ESLintProgram } from 'vue-eslint-parser/ast';

export type FileInfo = {
  path: string,
  source: string
}

export enum ParserType {
  // eslint-disable-next-line no-unused-vars
  FindJsxInScript = 'FindJsxInScript'
}

export enum TransformationType {
  // eslint-disable-next-line no-unused-vars
  addJsxTransformation = 'addJsxTransformation',
  // eslint-disable-next-line no-unused-vars
  removeHtmlLangInTemplateTransformation = 'removeHtmlLangInTemplateTransformation',
  // eslint-disable-next-line no-unused-vars
  indexHtmlTransformation = 'indexHtmlTransformation'
}

export type VueSFCContext = {
  path: string
  source: string
  templateAST: ESLintProgram,
  scriptAST: any,
  jscodeshiftParser: JSCodeshift,
  descriptor: SFCDescriptor
}

export type ParsingResultOccurrence = {
  fileInfo: FileInfo,
  offsetBegin: number,
  offsetEnd: number,
  type: ParserType
}

export type TransformationResult = {
  fileInfo: FileInfo,
  content: string,
  type: TransformationType
}

export type ParsingResult = {
  [name: string]: ParsingResultOccurrence[]
}

export function astParseRoot (rootDir: string) {
  const resolvedPaths : string[] = globby.sync(rootDir.replace(/\\/g, '/'))
  const parsingResults: ParsingResult = {}
  resolvedPaths.forEach(filePath => {
    // skip files in node_modules
    if (filePath.indexOf('/node_modules/') >= 0) {
      return
    }

    const extension = (/\.([^.]*)$/.exec(filePath) || [])[0]

    const source: string = fs.readFileSync(filePath).toString().split('\r\n').join('\n')
    const fileInfo: FileInfo = {
      path: filePath,
      source: source
    }
    let transformationResultContent: string = source
    let tempTransformationResult: TransformationResult | null

    // iter all transformations
    for (const key in transformationMap) {
      const transformation = transformationMap[key]

      // filter by file extension
      const extensions: string[] = transformation.extensions
      if (!extensions.includes(extension)) {
        continue
      }

      // execute the transformation
      tempTransformationResult = transformation.astTransform(fileInfo)
      if (tempTransformationResult == null) {
        continue
      }
      transformationResultContent = tempTransformationResult.content

      if (transformation.needReparse) {
        fileInfo.source = transformationResultContent
      }
      if (transformation.needWriteToOriginFile) {
        fs.writeFileSync(filePath, transformationResultContent)
      }
    }

    for (const key in parsersMap) {
      const parser = parsersMap[key]

      // filter by file extension
      const extensions: string[] = parser.extensions
      if (!extensions.includes(extension)) {
        continue
      }

      // parse the file
      const parsingResult: ParsingResultOccurrence[] | null = parser.astParse(fileInfo)
      if (!parsingResult) {
        continue
      }

      if (!parsingResults[parser.parserType]) {
        parsingResults[parser.parserType] = []
      }
      parsingResults[parser.parserType].push.apply(parsingResults[parser.parserType], parsingResult)
    }
  })

  return parsingResults
}

export function parseVueSfc (fileInfo: FileInfo) : VueSFCContext {
  if (!fileInfo.source || fileInfo.source.length === 0) {
    fileInfo.source = fs.readFileSync(fileInfo.path).toString().split('\r\n').join('\n')
  }
  const astParseResult = vueSfcAstParser(fileInfo)
  const context : VueSFCContext = {
    path: fileInfo.path,
    source: fileInfo.source,
    templateAST: astParseResult.templateAST,
    scriptAST: astParseResult.scriptAST,
    jscodeshiftParser: astParseResult.jscodeshiftParser,
    descriptor: astParseResult.descriptor
  }

  return context
}
