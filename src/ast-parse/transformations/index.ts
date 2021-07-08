import { FileInfo, TransformationResult } from '../astParse';

export type ASTTransformation<Params = any> = {
  (fileInfo: FileInfo, params: Params): TransformationResult | null
}

export enum TransformationType {
  // eslint-disable-next-line no-unused-vars
  addJsxTransformation = 'addJsxTransformation',
  // eslint-disable-next-line no-unused-vars
  removeHtmlLangInTemplateTransformation = 'removeHtmlLangInTemplateTransformation',
  // eslint-disable-next-line no-unused-vars
  indexHtmlTransformation = 'indexHtmlTransformation'
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
  indexHtmlTransformation: require('./indexHtmlTransformation')
}
