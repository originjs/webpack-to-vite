import type { Node } from 'vue-eslint-parser/ast/nodes'
import * as parser from 'vue-eslint-parser'
import type { ArrowFunctionExpression, FunctionExpression } from 'jscodeshift'
import type { ASTParse, ParserType } from './index'
import { PARSER_TYPES } from '../../constants/constants'
import type {
  FileInfo,
  ParsingResultOccurrence
} from '../astParse'
import { parseScriptSfc } from '../../utils/astUtils'
import { recordConver } from '../../utils/report'

export const astParse: ASTParse = (fileInfo: FileInfo) => {
  let nodePaths: Node[]
  if (/vue\.config\.js$/.test(fileInfo.path)) {
    const context = parseScriptSfc(fileInfo)
    if (!context || !context.__paths) {
      return null
    }
    nodePaths = context.__paths
  } else if (/vue\.config\.ts$/.test(fileInfo.path)) {
    const context = parseScriptSfc(fileInfo, 'ts')
    if (!context || !context.__paths) {
      return null
    }
    nodePaths = context.__paths
  } else {
    return null
  }

  const results: ParsingResultOccurrence[] = []
  let chainWebpackNode: ArrowFunctionExpression | FunctionExpression
  let paramName: string

  nodePaths.forEach(root => {
    parser.AST.traverseNodes(root, {
      enterNode (node: any) {
        // find chainWebpack node
        const isChainWebpackNode: boolean = node.type === 'ObjectProperty' &&
          node.key.type === 'Identifier' &&
          node.key.name === 'chainWebpack'
        const isFunctionalNode: boolean = node.type === 'ObjectProperty' &&
          (node.value.type === 'ArrowFunctionExpression' ||
          node.value.type === 'FunctionExpression')
        const isChainWebpackFunctionalNode: boolean = node.type === 'ObjectMethod' &&
          node.key.type === 'Identifier' &&
          node.key.name === 'chainWebpack'
        if ((isChainWebpackNode && isFunctionalNode) || isChainWebpackFunctionalNode) {
          chainWebpackNode = isChainWebpackFunctionalNode ? node : node.value
        }
      },
      leaveNode () {}
    })
  })

  if (chainWebpackNode) {
    const chainWebpackResult: ParsingResultOccurrence = {
      fileInfo: fileInfo,
      offsetBegin: chainWebpackNode.loc.start.line,
      offsetEnd: chainWebpackNode.loc.end.line,
      type: parserType
    }
    // results[0]: chainWebpackNode
    results.push(chainWebpackResult)

    // get param name
    if (chainWebpackNode.params && chainWebpackNode.params.length &&
      chainWebpackNode.params[0].type === 'Identifier') {
      paramName = chainWebpackNode.params[0].name
    }

    const webpackRoot = chainWebpackNode as Node
    parser.AST.traverseNodes(webpackRoot, {
      enterNode (node: any) {
        // find `config.plugin('html').tap(callback)`
        if (!(node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'CallExpression')) {
          return
        }
        const isConfigNode: boolean = node.callee.object.callee.type === 'MemberExpression' &&
          node.callee.object.callee.object.type === 'Identifier' &&
          node.callee.object.callee.object.name === paramName
        const isPluginNode: boolean = node.callee.object.callee.type === 'MemberExpression' &&
          node.callee.object.callee.property.type === 'Identifier' &&
          node.callee.object.callee.property.name === 'plugin'
        const isHtmlNode: boolean = node.callee.object.arguments.length &&
          node.callee.object.arguments[0].type === 'StringLiteral' &&
          node.callee.object.arguments[0].value === 'html'
        const isTapNode: boolean = node.callee.property.type === 'Identifier' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'tap'
        const hasTapArgs: boolean = node.arguments.length &&
          (node.arguments[0].type === 'ArrowFunctionExpression' ||
          node.arguments[0].type === 'FunctionExpression') &&
          node.arguments[0].body.type === 'BlockStatement' &&
          node.arguments[0].params.length &&
          node.arguments[0].params[0].type === 'Identifier'

        if (isConfigNode && isPluginNode && isHtmlNode && isTapNode && hasTapArgs) {
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
          // results[1]: config.plugin('html') | null
          // results[2]: callback of plugin('html') | null
          results.push(htmlPluginResult, htmlPluginOptionsResult)
        }
      },
      leaveNode () {}
    })
  }

  recordConver({ num: 'V08', feat: 'transform functional webpack config' })
  return results
}

export const extensions: string[] = ['.js', '.ts']

export const parserType: ParserType = PARSER_TYPES.FindHtmlPluginChain
