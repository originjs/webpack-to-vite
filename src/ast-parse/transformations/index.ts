import { FileInfo, TransformationResult, TransformationParams } from '../astParse'

export type ASTTransformation<Params = TransformationParams> = {
   (fileInfo: FileInfo, params: Params): Promise<TransformationResult> | null
}

export enum TransformationType {
  // eslint-disable-next-line no-unused-vars
  addJsxTransformation = 'addJsxTransformation',
  // eslint-disable-next-line no-unused-vars
  removeHtmlLangInTemplateTransformation = 'removeHtmlLangInTemplateTransformation',
  // eslint-disable-next-line no-unused-vars
  indexHtmlTransformationVueCli = 'indexHtmlTransformationVueCli',
  // eslint-disable-next-line no-unused-vars
  indexHtmlTransformationWebpack = 'indexHtmlTransformationWebpack',
  // eslint-disable-next-line no-unused-vars
  lazyLoadingRoutesTransformation = 'lazyLoadingRoutesTransformation'
}

export const transformationMap: {
  [name: string]: {
    astTransform: ASTTransformation,
    needReparse: boolean,
    needWriteToOriginFile: boolean,
    extensions: string[],
    transformationType: TransformationType
  }
} = {
  addJsxTransformation: require('./addJsxTransformation'),
  removeHtmlLangInTemplateTransformation: require('./removeHtmlLangInTemplateTransformation'),
  indexHtmlTransformationVueCli: require('./indexHtmlTransformationVueCli'),
  indexHtmlTransformationWebpack: require('./indexHtmlTransformationWebpack'),
  lazyLoadingRoutesTransformation: require('./lazyLoadingRoutesTransformation')
}
