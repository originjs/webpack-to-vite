import type { ASTParse, ParserType } from './index'
import { PARSER_TYPES } from '../../constants/constants'
import type {
  FileInfo,
  ParsingResultIdentifer
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
  }

  const results: ParsingResultIdentifer[] = []
  let inConfigureWebpack: boolean = false
  let configureWebpackNode: Node

  nodePaths.forEach(root => {
    parser.AST.traverseNodes(root, {
      enterNode (node: Node) {
        if (inConfigureWebpack &&
            (node.type === 'ArrowFunctionExpression' ||
            node.type === 'FunctionExpression')) {
          configureWebpackNode = node
          return false
        }
        if (node.type === 'Identifier' && node.name === 'configureWebpack') {
          inConfigureWebpack = true
        }
        return true
      },
      leaveNode () {}
    })
  })

  if (configureWebpackNode &&
    (configureWebpackNode.type === 'ArrowFunctionExpression' ||
    configureWebpackNode.type === 'FunctionExpression')) {
    let paramName = 'config'
    if (configureWebpackNode.params && configureWebpackNode.params.length && configureWebpackNode.params[0].type === 'Identifier') {
      paramName = configureWebpackNode.params[0].name
    }
    let bodyNodes = configureWebpackNode.body.body
    bodyNodes.forEach(node => {
      if (node.type === 'ExpressionStatement' &&
          node.expression.type === 'AssignmentExpression' &&
          node.expression.left.type === 'MemberExpression'
      ) {
        let configNode: Node = node.expression.left
        const attrs = []
        while (configNode.type === 'MemberExpression' &&
              configNode.object.type === 'MemberExpression' &&
              configNode.property.type === 'Identifier') {
          attrs.push(configNode.property.name)
          configNode = configNode.object
        }
        if (configNode.object.type === 'Identifier' &&
              configNode.object.name === paramName &&
              configNode.property.type === 'Identifier') {
          attrs.push(configNode.property.name)
        }
        results.push(attrs)
      } else if (node.type === 'IfStatement' && node.consequent.type === 'BlockStatement') {
        bodyNodes = bodyNodes.concat(node.consequent.body)
      }
    })
  }

  return results
}

export const extensions: string[] = ['.js', '.ts']

export const parserType: ParserType = PARSER_TYPES.FindWebpackConfigureAttrs
