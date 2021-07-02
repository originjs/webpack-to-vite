// import { ESLintProgram } from 'vue-eslint-parser/ast/nodes';
import { FileInfo } from '../astParse';

export type ASTTransformation<Params = void> = {
  (fileInfo: FileInfo, params: Params): string | null
}

export const transformationMap: {
  [name: string]: {
    transformAST: ASTTransformation,
    needReparse: boolean,
    extensions: string[]
  }
} = {
  addJsxTransformation: require('./addJsxTransformation'),
  removeHtmlLangInTemplateTransformation: require('./removeHtmlLangInTemplateTransformation')
}
