import type { ASTTransformation } from './index'
import { TransformationType } from './index'
import { FileInfo, TransformationResult } from '../astParse'
import { ESLintProgram } from 'vue-eslint-parser/ast';
import * as parser from 'vue-eslint-parser';
import { Node } from 'vue-eslint-parser/ast/nodes'

const INDEX_HTML_PATH: string = 'public/index.html'
const templateStart: string = '<template>'
const templateEnd: string = '</template>'

export const astTransform:ASTTransformation = (fileInfo: FileInfo) => {
  if (!fileInfo.path.replace('\\', '/').endsWith(INDEX_HTML_PATH)) {
    return null
  }

  // add template tags for vue-eslint-parser
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
  let transformedHtml: string = htmlContent.slice(0, bodyNode.endTag.range[0]) + '{0}' + htmlContent.slice(bodyNode.endTag.range[0])
  // remove template tags
  transformedHtml = transformedHtml.slice(0, transformedHtml.length - templateEnd.length)
  transformedHtml = transformedHtml.slice(templateStart.length)
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
