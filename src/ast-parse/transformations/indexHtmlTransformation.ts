import type { ASTTransformation } from './index'
import { TransformationType } from './index'
import { FileInfo, TransformationResult } from '../astParse'
import { ESLintProgram } from 'vue-eslint-parser/ast';
import * as parser from 'vue-eslint-parser';
import { Node } from 'vue-eslint-parser/ast/nodes'
import { stringSplice } from '../../utils/common';

const templateStart: string = '<template>'
const templateEnd: string = '</template>'

export const astTransform:ASTTransformation = (fileInfo: FileInfo, indexPath: string) => {
  if (!indexPath || !fileInfo.path.replace('\\', '/').endsWith(indexPath)) {
    return null
  }

  // add template tags for vue-eslint-parser
  let htmlContent = `${templateStart}${fileInfo.source}${templateEnd}`
  const htmlAST : ESLintProgram = parser.parse(htmlContent, { sourceType: 'module' })
  const root: Node = htmlAST.templateBody
  let offset: number = 0
  let bodyNode
  parser.AST.traverseNodes(root, {
    enterNode (node: Node) {
      if (node.type === 'VElement' && node.name === 'body') {
        bodyNode = node
      } else if (node.type === 'VElement' && node.name === 'script') {
        const nodeAttrs = node.startTag.attributes;
        // remove original entriy scripts with indent
        if (nodeAttrs[0]?.key.name === 'type' && nodeAttrs[0].value.type === 'VLiteral' && nodeAttrs[0].value.value === 'module' && nodeAttrs[1].key.name === 'src') {
          htmlContent = stringSplice(htmlContent, node.range[0] - 2, node.range[1] + 1, offset)
          offset += node.range[1] - node.range[0] + 4
        }
      }
    },
    leaveNode () {}
  })

  let transformedHtml: string = htmlContent.slice(0, bodyNode.endTag.range[0] - offset) + '{0}' + htmlContent.slice(bodyNode.endTag.range[0] - offset)
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
