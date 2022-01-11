import type {
  FileInfo,
  TransformationResult,
  TransformationParams
} from '../astParse'
import type { TRANSFORMATION_TYPES } from '../../constants/constants'

import * as addJsxTransformation from './addJsxTransformation'
import * as removeHtmlLangInTemplateTransformation from './removeHtmlLangInTemplateTransformation'
import * as indexHtmlTransformationVueCli from './indexHtmlTransformationVueCli'
import * as indexHtmlTransformationWebpack from './indexHtmlTransformationWebpack'
import * as lazyLoadingRoutesTransformation from './lazyLoadingRoutesTransformation'

export type ASTTransformation<Params = TransformationParams> = {
  (fileInfo: FileInfo, params: Params): Promise<TransformationResult> | null
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
  indexHtmlTransformationVueCli,
  indexHtmlTransformationWebpack,
  lazyLoadingRoutesTransformation
}
