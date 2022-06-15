import path from 'path'
import type { ASTTransformation, TransformationType } from './index'
import { TRANSFORMATION_TYPES, VUE_CONFIG_HTML_PLUGIN } from '../../constants/constants'
import type {
  FileInfo,
  TransformationResult,
  TransformationParams,
  ParsingResult
} from '../astParse'
import { getStringLinePosition } from '../../utils/common'
import { writeSync } from '../../utils/file'
import { recordConver } from '../../utils/report'

export const astTransform: ASTTransformation = async (
  fileInfo: FileInfo,
  transformationParams?: TransformationParams,
  parsingResult?: ParsingResult
) => {
  if (!transformationParams || !transformationParams.rootDir) {
    return null
  }
  if (transformationParams.config.projectType === 'webpack') {
    return null
  }
  if (!/vue\.config\.(js|ts)$/.test(fileInfo.path)) {
    return null
  }

  const rootDir: string = transformationParams.rootDir
  const extension: string = (/\.([^.]*)$/.exec(fileInfo.path) || [])[0]

  // transform vueConfig.chainWebpack
  const vueConfigTempPath: string = path.resolve(rootDir, `vue.temp.config${extension}`)
  let vueConfigContent: string = fileInfo.source
  if (parsingResult && parsingResult.FindHtmlPluginChain && parsingResult.FindHtmlPluginChain.length) {
    const chainWebpackResult: any = parsingResult.FindHtmlPluginChain[0]
    const chainWebpackSource: string = chainWebpackResult.fileInfo.source
    const chainWebpackEnd: number = getStringLinePosition(chainWebpackSource, chainWebpackResult.offsetEnd)

    if (parsingResult.FindHtmlPluginChain.length > 1) {
      const htmlPluginResult: any = parsingResult.FindHtmlPluginChain[1]
      const htmlPluginStart: number = getStringLinePosition(htmlPluginResult.fileInfo.source, htmlPluginResult.offsetBegin - 1)
      const htmlPluginEnd: number = getStringLinePosition(htmlPluginResult.fileInfo.source, htmlPluginResult.offsetEnd)

      const htmlPluginOptionsResult: any = parsingResult.FindHtmlPluginChain[2]
      const htmlPluginOptionsStart: number = getStringLinePosition(htmlPluginOptionsResult.fileInfo.source, htmlPluginOptionsResult.offsetBegin)
      const htmlPluginOptionsEnd: number = getStringLinePosition(htmlPluginOptionsResult.fileInfo.source, htmlPluginOptionsResult.offsetEnd - 1)
      const htmlPluginOptionsParamName: string = htmlPluginOptionsResult.params.paramName

      vueConfigContent = `${chainWebpackSource.slice(0, htmlPluginStart)}\n${chainWebpackSource.slice(htmlPluginEnd, chainWebpackEnd)}\n` +
        `${VUE_CONFIG_HTML_PLUGIN}: (${htmlPluginOptionsParamName}) => {\n${chainWebpackSource.slice(htmlPluginOptionsStart, htmlPluginOptionsEnd)}\n},` +
        `${chainWebpackSource.slice(chainWebpackEnd)}`
    }
  }

  writeSync(vueConfigTempPath, vueConfigContent)

  recordConver({ num: 'V08', feat: 'transform functional webpack config' })

  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: vueConfigContent,
    type: TRANSFORMATION_TYPES.chainWebpackTransformation
  }

  return result
}

export const needReparse: boolean = true

export const needWriteToOriginFile: boolean = false

export const extensions: string[] = ['.ts', '.js']

export const transformationType: TransformationType =
  TRANSFORMATION_TYPES.chainWebpackTransformation
