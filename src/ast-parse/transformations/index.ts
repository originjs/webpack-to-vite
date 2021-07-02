// import { ESLintProgram } from 'vue-eslint-parser/ast/nodes';
import { JSCodeshift } from 'jscodeshift/src/core';
import { SFCDescriptor } from '@originjs/vue-sfc-ast-parser'

export type Context = {
  path: string
  source: string
  // templateAST: ESLintProgram,
  templateAST: any,
  scriptAST: any,
  jscodeshiftParser: JSCodeshift,
  descriptor: SFCDescriptor
}

export type ASTTransformation<Params = void> = {
  (context: Context, params: Params): string | null
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
