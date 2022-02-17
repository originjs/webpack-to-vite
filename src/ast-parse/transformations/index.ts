import type {
  FileInfo,
  TransformationResult,
  TransformationParams,
  ParsingResult
} from '../astParse'
import type { TRANSFORMATION_TYPES } from '../../constants/constants'

import * as addJsxTransformation from './addJsxTransformation'
import * as removeHtmlLangInTemplateTransformation from './removeHtmlLangInTemplateTransformation'
import * as indexHtmlTransformationVueCli from './indexHtmlTransformationVueCli'
import * as indexHtmlTransformationWebpack from './indexHtmlTransformationWebpack'
import * as lazyLoadingRoutesTransformation from './lazyLoadingRoutesTransformation'
import * as chainWebpackTransformation from './chainWebpackTransformation'

export type ASTTransformation<Params = TransformationParams> = {
  (fileInfo: FileInfo, params: Params, parsingResults: ParsingResult): Promise<TransformationResult> | null
}

export type TransformationType =
  typeof TRANSFORMATION_TYPES[keyof typeof TRANSFORMATION_TYPES]

export const transformationMap: {
  [name: string]: {
    astTransform: ASTTransformation
    needReparse: boolean
    needWriteToOriginFile: boolean
    extensions: string[]
    transformationType: TransformationType
  }
} = {
  addJsxTransformation,
  removeHtmlLangInTemplateTransformation,
  lazyLoadingRoutesTransformation,
  // transform in order
  chainWebpackTransformation,
  indexHtmlTransformationVueCli,
  indexHtmlTransformationWebpack
}
