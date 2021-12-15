import { transformationMap, TransformationType } from './transformations'
import { parsersMap, ParserType } from './parsers'
import { SFCDescriptor } from '@originjs/vue-sfc-ast-parser'
import * as globby from 'globby'
import { JSCodeshift } from 'jscodeshift/src/core'
import { ESLintProgram } from 'vue-eslint-parser/ast'
import { Config } from '../config/config'
import { cliInstance } from '../cli/cli'
import { pathFormat, readSync, writeSync } from '../utils/file';

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

export type TransformationParams = {
  config: Config
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

export async function astParseRoot (rootDir: string, config: Config): Promise<AstParsingResult> {
  const replacedRootDir: string = pathFormat(rootDir)
  const resolvedPaths : string[] = globby.sync([replacedRootDir, `!${replacedRootDir}/**/node_modules`, `!${replacedRootDir}/**/dist`])
  const parsingResults: ParsingResult = {}
  const transformationResults: AstTransformationResult = {}

  const transformationParams: TransformationParams = {
    config: config
  }
  cliInstance.setTotal(cliInstance.total + resolvedPaths.length)
  for (const filePath of resolvedPaths) {
    cliInstance.increment({ doSomething: `AST Parsing: ${filePath}` })

    const extension = (/\.([^.]*)$/.exec(filePath) || [])[0]

    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
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
      try {
        tempTransformationResult = await transformation.astTransform(fileInfo, transformationParams)
      } catch (e) {
        if (extension === '.js') {
          console.warn(
            '\n\nFailed to parse .js file because the content contains invalid JS syntax. ' +
              'If you are using JSX, make sure to name the file with the .jsx or .tsx extension.'
          )
        }
        console.error(`AST parsing and transformation file failed, filePath: ${filePath}\n`, e)
        console.log('skip parsing the error file...')
        continue
      }

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
        writeSync(filePath, transformationResultContent)
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
      let parsingResult: ParsingResultOccurrence[] | null
      try {
        parsingResult = parser.astParse(fileInfo)
      } catch (e) {
        if (extension === '.js') {
          console.warn(
            '\nFailed to parse .js file because the content contains invalid JS syntax. ' +
              'If you are using JSX, make sure to name the file with the .jsx or .tsx extension.'
          )
        }
        console.error(`AST parsing file failed, filePath: ${filePath}\n`, e)
        console.log('skip parsing the error file...')
        continue
      }

      if (!parsingResult) {
        continue
      }

      if (!parsingResults[parser.parserType]) {
        parsingResults[parser.parserType] = []
      }
      parsingResults[parser.parserType].push.apply(parsingResults[parser.parserType], parsingResult)
    }
  }

  return {
    parsingResult: parsingResults,
    transformationResult: transformationResults
  }
}
