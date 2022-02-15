import merge from 'webpack-merge'
import ChainConfig from 'webpack-chain'
import type { Configuration } from 'webpack'
import path from 'path'
import { existsSync } from 'fs'
import { parseVueCliConfig, applyAstParsingResultToConfig } from '../config/parse'
import type { TransformationType } from './transformations'
import { transformationMap } from './transformations'
import type { ParserType } from './parsers'
import { parsersMap } from './parsers'
import type { SFCDescriptor } from '@originjs/vue-sfc-ast-parser'
import * as globby from 'globby'
import type { JSCodeshift } from 'jscodeshift/src/core'
import type { ESLintProgram } from 'vue-eslint-parser/ast'
import type { Config } from '../config/config'
import { cliInstance } from '../cli/cli'
import { pathFormat, readSync, writeSync } from '../utils/file'
import { PARSER_TYPES, TRANSFORMATION_TYPES, VUE_CONFIG_HTML_PLUGIN } from '../constants/constants'

export type FileInfo = {
  path: string
  source: string
}

export type VueSFCContext = {
  path: string
  source: string
  templateAST: ESLintProgram
  scriptAST: any
  jscodeshiftParser: JSCodeshift
  descriptor: SFCDescriptor
}

export type ParsingResultOccurrence = {
  fileInfo: FileInfo
  offsetBegin: number
  offsetEnd: number
  type: ParserType
  params?: any
}

export type ParsingResultProperty = {
  name: string
  type: string
}

export type TransformationParams = {
  config: Config
  context?: string
  htmlPlugin?: any
}

export type TransformationResult = {
  fileInfo: FileInfo
  content: string
  type: TransformationType
}

export type AstTransformationResult = {
  [name: string]: TransformationResult[]
}

export type ParsingResult = {
  [name: string]: ParsingResultOccurrence[] | ParsingResultProperty[][]
}

export type AstParsingResult = {
  parsingResult: ParsingResult
  transformationResult: AstTransformationResult
}

export async function astParseRoot (
  rootDir: string,
  config: Config
): Promise<AstParsingResult> {
  const replacedRootDir: string = pathFormat(rootDir)
  const resolvedPaths: string[] = globby.sync([
    replacedRootDir,
    `!${replacedRootDir}/**/node_modules`,
    `!${replacedRootDir}/**/dist`
  ])
  const parsingResults: ParsingResult = {}
  const transformationResults: AstTransformationResult = {}

  const excuteParse = (parser, fileInfo, extension: string) => {
    const { path: filePath } = fileInfo
    let parsingResult: ParsingResultOccurrence[] | ParsingResultProperty[][] | null

    // parse the file
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
      return
    }

    if (!parsingResult) {
      return
    }

    if (!parsingResults[parser.parserType]) {
      parsingResults[parser.parserType] = []
    }
    parsingResults[parser.parserType].push.apply(
      parsingResults[parser.parserType],
      parsingResult
    )
  }

  const excuteTransform = async (transformation, transformationParams: TransformationParams, fileInfo, extension: string) => {
    const { path: filePath, source } = fileInfo
    let transformationResultContent: string = source
    let tempTransformationResult: TransformationResult | null

    // execute the transformation
    try {
      tempTransformationResult = await transformation.astTransform(
        fileInfo,
        transformationParams,
        parsingResults
      )
    } catch (e) {
      if (extension === '.js') {
        console.warn(
          '\n\nFailed to parse .js file because the content contains invalid JS syntax. ' +
              'If you are using JSX, make sure to name the file with the .jsx or .tsx extension.'
        )
      }
      console.error(
          `AST parsing and transformation file failed, filePath: ${filePath}\n`,
          e
      )
      console.log('skip parsing the error file...')
      return
    }

    if (tempTransformationResult == null) {
      return
    }
    if (!transformationResults[transformation.transformationType]) {
      transformationResults[transformation.transformationType] = []
    }
    transformationResults[transformation.transformationType].push(
      tempTransformationResult
    )
    transformationResultContent = tempTransformationResult.content

    if (transformation.needReparse) {
      fileInfo.source = transformationResultContent
      // iter all parsers
      for (const key in parsersMap) {
        cliInstance.increment({ doSomething: `AST Parsing: ${filePath}` })
        const parser = parsersMap[key]

        // filter by file extension
        const extensions: string[] = parser.extensions
        if (!extensions.includes(extension)) {
          continue
        }
        excuteParse(parser, fileInfo, extension)
      }
    }
    if (transformation.needWriteToOriginFile) {
      writeSync(filePath, transformationResultContent)
    }
  }

  // add parseVueCliConfig to transformationParams
  const setTransformParamsWithHtmlConfig = async (transformationParams: TransformationParams) => {
    const vueConfigPath = existsSync(path.resolve(replacedRootDir, 'vue.temp.config.ts'))
      ? path.resolve(replacedRootDir, 'vue.temp.config.ts')
      : path.resolve(replacedRootDir, 'vue.temp.config.js')
    const vueConfig = await parseVueCliConfig(vueConfigPath)

    // vueConfig.configureWebpack
    let webpackConfig: Configuration = {}
    if (vueConfig.configureWebpack && typeof vueConfig.configureWebpack !== 'function') {
      webpackConfig = vueConfig.configureWebpack
    } else if (vueConfig.configureWebpack) {
      try {
        webpackConfig = applyAstParsingResultToConfig(webpackConfig, PARSER_TYPES.FindWebpackConfigProperties, parsingResults)
        await vueConfig.configureWebpack(webpackConfig)
      } catch (e) {
        console.log(e)
      }
    }

    // vueConfig.chainWebpack
    const chainableConfig = new ChainConfig()
    if (vueConfig.chainWebpack) {
      try {
        await vueConfig.chainWebpack(chainableConfig)
      } catch (e) {
        console.error(e)
      }
    }

    webpackConfig = merge(chainableConfig.toConfig(), webpackConfig)

    let htmlPlugin: any
    if (webpackConfig.plugins) {
      htmlPlugin = webpackConfig.plugins.find((p: any) =>
        p.constructor.name === 'HtmlWebpackPlugin' &&
        (!p.filename || p.filename === 'index.html'))
      if (htmlPlugin) {
        htmlPlugin.options = htmlPlugin.options || htmlPlugin.userOptions
      }
    }
    // vueConfig.chainWebpack => plugin('html')
    if (vueConfig[VUE_CONFIG_HTML_PLUGIN]) {
      const htmlPluginArgs = [{}]
      vueConfig[VUE_CONFIG_HTML_PLUGIN](htmlPluginArgs)
      if (!htmlPlugin) {
        htmlPlugin = {}
      }
      const { options = {} } = htmlPlugin
      const mergedOptions = Object.assign({}, options, htmlPluginArgs[0])
      htmlPlugin.options = mergedOptions
    }
    transformationParams.htmlPlugin = htmlPlugin
    transformationParams.context = webpackConfig.context
    return transformationParams
  }

  // iter all parsers
  for (const key in parsersMap) {
    for (const filePath of resolvedPaths) {
      cliInstance.increment({ doSomething: `AST Parsing: ${filePath}` })

      const extension = (/\.([^.]*)$/.exec(filePath) || [])[0]
      const parser = parsersMap[key]

      // filter by file extension
      const extensions: string[] = parser.extensions
      if (!extensions.includes(extension)) {
        continue
      }

      const source: string = readSync(filePath).replace(/\r\n/g, '\n')
      const fileInfo: FileInfo = {
        path: filePath,
        source: source
      }
      excuteParse(parser, fileInfo, extension)
    }
  }

  // iter all transformations
  for (const key in transformationMap) {
    const transformation = transformationMap[key]

    let transformationParams: TransformationParams = {
      config: config
    }
    if (key === TRANSFORMATION_TYPES.indexHtmlTransformationVueCli) {
      transformationParams = await setTransformParamsWithHtmlConfig(transformationParams)
    }

    for (const filePath of resolvedPaths) {
      cliInstance.increment({ doSomething: `AST Parsing: ${filePath}` })

      const extension = (/\.([^.]*)$/.exec(filePath) || [])[0]
      // filter by file extension
      const extensions: string[] = transformation.extensions
      if (!extensions.includes(extension)) {
        continue
      }

      const source: string = readSync(filePath).replace(/\r\n/g, '\n')
      const fileInfo: FileInfo = {
        path: filePath,
        source: source
      }

      await excuteTransform(transformation, transformationParams, fileInfo, extension)
    }
  }

  return {
    parsingResult: parsingResults,
    transformationResult: transformationResults
  }
}
