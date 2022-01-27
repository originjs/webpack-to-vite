import type { ASTParse, ParserType } from './index'
import { PARSER_TYPES } from '../../constants/constants'
import type {
  FileInfo,
  ParsingResultProperty
} from '../astParse'
import type { Node } from 'vue-eslint-parser/ast/nodes'
import * as parser from 'vue-eslint-parser'
import { parseIdentifierFromBodyNodes, parseScriptSfc } from '../../utils/astUtils'
import type { ArrowFunctionExpression, FunctionExpression } from 'jscodeshift'

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

  let results: ParsingResultProperty[][] = []
  let configureWebpackNode: ArrowFunctionExpression | FunctionExpression

  nodePaths.forEach(root => {
    parser.AST.traverseNodes(root, {
      enterNode (node: any) {
        // find configureWebpack
        if (node.type === 'ObjectProperty' &&
          node.key.type === 'Identifier' &&
          node.key.name === 'configureWebpack' &&
          (node.value.type === 'ArrowFunctionExpression' ||
          node.value.type === 'FunctionExpression')) {
          configureWebpackNode = node.value
        }
      },
      leaveNode () {}
    })
  })

  if (configureWebpackNode && configureWebpackNode.body.type === 'BlockStatement') {
    let paramName = 'config'
    if (configureWebpackNode.params && configureWebpackNode.params.length &&
        configureWebpackNode.params[0].type === 'Identifier') {
      paramName = configureWebpackNode.params[0].name
    }
    const bodyNodes = configureWebpackNode.body.body
    results = results.concat(parseIdentifierFromBodyNodes(bodyNodes, paramName))
  }

  return results
}

export const extensions: string[] = ['.js', '.ts']

export const parserType: ParserType = PARSER_TYPES.FindWebpackConfigAttrs
