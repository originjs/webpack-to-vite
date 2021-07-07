import { FileInfo, TransformationResult, TransformationType } from '../astParse';

export type ASTTransformation<Params = void> = {
  (fileInfo: FileInfo, params: Params): TransformationResult | null
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
