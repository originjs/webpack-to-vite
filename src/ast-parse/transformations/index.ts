// import { ESLintProgram } from 'vue-eslint-parser/ast/nodes';
import { FileInfo } from '../astParse';

export type ASTTransformation<Params = void> = {
  (fileInfo: FileInfo, params: Params): string | null
}

export const transformationMap: {
  [name: string]: {
    astTransform: ASTTransformation,
    needReparse: boolean,
    needWriteToOriginFile: boolean,
    extensions: string[]
  }
} = {
  addJsxTransformation: require('./addJsxTransformation'),
  removeHtmlLangInTemplateTransformation: require('./removeHtmlLangInTemplateTransformation')
}
