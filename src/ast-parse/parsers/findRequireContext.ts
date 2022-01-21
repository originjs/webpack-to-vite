import type { ASTParse, ParserType } from './index'
import { PARSER_TYPES } from '../../constants/constants'
import type {
  FileInfo,
  ParsingResultOccurrence,
  VueSFCContext
} from '../astParse'
import type { Node } from 'vue-eslint-parser/ast/nodes'
import * as parser from 'vue-eslint-parser'
import { parseVueSfc, parseScriptSfc } from '../../utils/astUtils'

export const astParse: ASTParse = (fileInfo: FileInfo) => {
  let nodePaths: Node[]
  if (/.vue$/.test(fileInfo.path)) {
    const context: VueSFCContext = parseVueSfc(fileInfo)
    if (!context.scriptAST || !context.scriptAST.__paths) {
      return null
    }
    nodePaths = context.scriptAST.__paths
  } else if (/.ts$/.test(fileInfo.path)) {
    const context = parseScriptSfc(fileInfo, 'ts')
    if (!context || !context.__paths) {
      return null
    }
    nodePaths = context.__paths
  } else {
    const context = parseScriptSfc(fileInfo)
    if (!context || !context.__paths) {
      return null
    }
    nodePaths = context.__paths
  }

  const results: ParsingResultOccurrence[] = []

  nodePaths.forEach(root => {
    parser.AST.traverseNodes(root, {
      enterNode (node: Node) {
        if (node.type === 'MemberExpression') {
          const includeRequire: boolean =
            node.object.type === 'Identifier' &&
            node.object.name === 'require'
          const includeRequireContext: boolean =
            node.property.type === 'Identifier' &&
            node.property.name === 'context'
          if (includeRequire && includeRequireContext) {
            const result: ParsingResultOccurrence = {
              fileInfo: fileInfo,
              offsetBegin: node.start,
              offsetEnd: node.end,
              type: parserType
            }
            results.push(result)
          }
        }
      },
      leaveNode () {}
    })
  })

  return results
}

export const extensions: string[] = ['.js', '.ts', '.vue']

export const parserType: ParserType = PARSER_TYPES.FindRequireContextParser
