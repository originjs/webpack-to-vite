import type { ASTParse, ParserType } from './index'
import { PARSER_TYPES } from '../../constants/constants'
import type {
  FileInfo,
  ParsingResultOccurrence
} from '../astParse'
import type { Node } from 'vue-eslint-parser/ast/nodes'
import * as parser from 'vue-eslint-parser'
import { parseScriptSfc } from '../../utils/astUtils'

export const astParse: ASTParse = (fileInfo: FileInfo) => {
  let nodePaths: Node[]
  if (/vue.config.js$/.test(fileInfo.path)) {
    const context = parseScriptSfc(fileInfo)
    if (!context || !context.__paths) {
      return null
    }
    nodePaths = context.__paths
  } else if (/vue.config.ts$/.test(fileInfo.path)) {
    const context = parseScriptSfc(fileInfo, 'ts')
    if (!context || !context.__paths) {
      return null
    }
    nodePaths = context.__paths
  } else {
    return null
  }

  const results: ParsingResultOccurrence[] = []
  let chainWebpackNode: Node
  let paramName: string

  nodePaths.forEach(root => {
    parser.AST.traverseNodes(root, {
      enterNode (node: any) {
        // find chainWebpack
        if (node.type === 'ObjectProperty' &&
          node.key.type === 'Identifier' &&
          node.key.name === 'chainWebpack' &&
          (node.value.type === 'ArrowFunctionExpression' ||
          node.value.type === 'FunctionExpression')) {
          chainWebpackNode = node.value
          const chainWebpackResult: ParsingResultOccurrence = {
            fileInfo: fileInfo,
            offsetBegin: node.loc.start.line,
            offsetEnd: node.loc.end.line,
            type: parserType
          }
          results.push(chainWebpackResult)
          if (node.value.params && node.value.params.length &&
            node.value.params[0].type === 'Identifier') {
            paramName = node.value.params[0].name
          }
        }
      },
      leaveNode () {}
    })
  })

  if (chainWebpackNode) {
    parser.AST.traverseNodes(chainWebpackNode, {
      enterNode (node: any) {
        // find `config.plugin('html').tap(callback)`
        if (node.type === 'CallExpression' &&
              node.callee.type === 'MemberExpression' &&
              node.callee.object.type === 'CallExpression' &&
              node.callee.object.arguments.length &&
              node.callee.object.arguments[0].type === 'StringLiteral' &&
              node.callee.object.arguments[0].value === 'html' &&
              node.callee.object.callee.type === 'MemberExpression' &&
              node.callee.object.callee.object.type === 'Identifier' &&
              node.callee.object.callee.object.name === paramName &&
              node.callee.object.callee.property.type === 'Identifier' &&
              node.callee.object.callee.property.name === 'plugin' &&
              node.callee.property.type === 'Identifier' &&
              node.callee.object.arguments.length &&
              node.callee.property.type === 'Identifier' &&
              node.callee.property.name === 'tap' &&
              node.arguments.length &&
              (node.arguments[0].type === 'ArrowFunctionExpression' ||
              node.arguments[0].type === 'FunctionExpression') &&
              node.arguments[0].body.type === 'BlockStatement' &&
              node.arguments[0].params.length &&
              node.arguments[0].params[0].type === 'Identifier') {
          const htmlPluginResult: ParsingResultOccurrence = {
            fileInfo: fileInfo,
            offsetBegin: node.loc.start.line,
            offsetEnd: node.loc.end.line,
            type: parserType
          }
          const htmlPluginOptionsResult: ParsingResultOccurrence = {
            fileInfo: fileInfo,
            offsetBegin: node.arguments[0].body.loc.start.line,
            offsetEnd: node.arguments[0].body.loc.end.line,
            type: parserType,
            params: {
              key: 'paramName',
              paramName: node.arguments[0].params[0].name
            }
          }
          results.push(htmlPluginResult, htmlPluginOptionsResult)
        }
      },
      leaveNode () {}
    })
  }

  // results[0]: chainWebpackNode
  // results[1]?: config.plugin('html')
  // results[2]?: callback of plugin('html')
  return results
}

export const extensions: string[] = ['.js', '.ts']

export const parserType: ParserType = PARSER_TYPES.FindChainWebpackConfigAttrs
