import { transformationMap, TransformationType } from './transformations/index'
import { parsersMap, ParserType } from './parsers/index'
import { SFCDescriptor } from '@originjs/vue-sfc-ast-parser'
import * as globby from 'globby'
import fs from 'fs'
import { JSCodeshift } from 'jscodeshift/src/core';
import { ESLintProgram } from 'vue-eslint-parser/ast';

export type FileInfo = {
  path: string,
  source: string
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

export type AstTransformationResult = {
  [name: string]: TransformationResult[]
}

export type ParsingResult = {
  [name: string]: ParsingResultOccurrence[]
}

export type AstParsingResult = {
  parsingResult: ParsingResult,
  transformationResult: AstTransformationResult
}

export function astParseRoot (rootDir: string): AstParsingResult {
  const resolvedPaths : string[] = globby.sync(rootDir.replace(/\\/g, '/'))
  const parsingResults: ParsingResult = {}
  const transformationResults: AstTransformationResult = {}
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
      if (!transformationResults[transformation.transformationType]) {
        transformationResults[transformation.transformationType] = []
      }
      transformationResults[transformation.transformationType].push(tempTransformationResult)
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

  return {
    parsingResult: parsingResults,
    transformationResult: transformationResults
  }
}
