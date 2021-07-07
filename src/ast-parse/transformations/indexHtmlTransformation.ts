import type { ASTTransformation } from './index'
import { FileInfo, TransformationResult } from '../astParse'
import { ESLintProgram } from 'vue-eslint-parser/ast';
import * as parser from 'vue-eslint-parser';
import { Node } from 'vue-eslint-parser/ast/nodes'
import { TransformationType } from './index';

const INDEX_HTML_PATH: string = 'public/index.html'

export const astTransform:ASTTransformation = (fileInfo: FileInfo) => {
  if (!fileInfo.path.replace('\\', '/').endsWith(INDEX_HTML_PATH)) {
    return null
  }

  const templateStart: string = '<template>'
  const templateEnd: string = '</template>'
  const htmlContent = `${templateStart}${fileInfo.source}${templateEnd}`
  const htmlAST : ESLintProgram = parser.parse(htmlContent, { sourceType: 'module' })
  const root: Node = htmlAST.templateBody
  let bodyNode
  parser.AST.traverseNodes(root, {
    enterNode (node: Node) {
      if (node.type === 'VElement' && node.name === 'body') {
        bodyNode = node
      }
    },
    leaveNode () {}
  })
  const transformedHtml: string = htmlContent.slice(0, bodyNode.endTag.range[0] - 1) + 'abcd' + htmlContent.slice(bodyNode.endTag.range[0] - 1)
  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: transformedHtml,
    type: TransformationType.removeHtmlLangInTemplateTransformation
  }

  return result
}

export const needReparse: boolean = false

export const needWriteToOriginFile: boolean = false

export const extensions: string[] = ['.html']

export const transformationType: TransformationType = TransformationType.indexHtmlTransformation
