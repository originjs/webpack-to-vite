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
  if (!transformationParams && !transformationParams.config.rootDir) {
    return null
  }
  if (transformationParams.config.projectType === 'webpack') {
    return null
  }
  if (!/vue.config.(js|ts)$/.test(fileInfo.path)) {
    return null
  }

  const rootDir: string = transformationParams.config.rootDir
  const extension: string = (/\.([^.]*)$/.exec(fileInfo.path) || [])[0]

  // transform vueConfig.chainWebpack
  const vueConfigTempPath: string = path.resolve(rootDir, `vue.temp.config${extension}`)
  let vueConfigContent: string = ''
  if (parsingResult && parsingResult.FindChainWebpackConfigProperties && parsingResult.FindChainWebpackConfigProperties.length) {
    const chainWebpackResult: any = parsingResult.FindChainWebpackConfigProperties[0]
    const chainWebpackSource: string = chainWebpackResult.fileInfo.source
    const chainWebpackEnd: number = getStringLinePosition(chainWebpackSource, chainWebpackResult.offsetEnd)

    if (parsingResult.FindChainWebpackConfigProperties.length > 1) {
      const htmlPluginResult: any = parsingResult.FindChainWebpackConfigProperties[1]
      const htmlPluginStart: number = getStringLinePosition(htmlPluginResult.fileInfo.source, htmlPluginResult.offsetBegin - 1)
      const htmlPluginEnd: number = getStringLinePosition(htmlPluginResult.fileInfo.source, htmlPluginResult.offsetEnd)

      const htmlPluginOptionsResult: any = parsingResult.FindChainWebpackConfigProperties[2]
      const htmlPluginOptionsStart: number = getStringLinePosition(htmlPluginOptionsResult.fileInfo.source, htmlPluginOptionsResult.offsetBegin)
      const htmlPluginOptionsEnd: number = getStringLinePosition(htmlPluginOptionsResult.fileInfo.source, htmlPluginOptionsResult.offsetEnd - 1)
      const htmlPluginOptionsParamName: string = htmlPluginOptionsResult.params.paramName

      vueConfigContent = `${chainWebpackSource.slice(0, htmlPluginStart)}\n${chainWebpackSource.slice(htmlPluginEnd, chainWebpackEnd)}\n` +
        `${VUE_CONFIG_HTML_PLUGIN}: (${htmlPluginOptionsParamName}) => {\n${chainWebpackSource.slice(htmlPluginOptionsStart, htmlPluginOptionsEnd)}\n},` +
        `${chainWebpackSource.slice(chainWebpackEnd)}`
    } else {
      vueConfigContent = chainWebpackSource
    }
  } else {
    vueConfigContent = fileInfo.source
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

export const needReparse: boolean = false

export const needWriteToOriginFile: boolean = false

export const extensions: string[] = ['.ts', '.js']

export const transformationType: TransformationType =
  TRANSFORMATION_TYPES.chainWebpackTransformation
