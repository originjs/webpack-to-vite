import { ASTParse, ParserType } from './index';
import { FileInfo, ParsingResultOccurrence } from '../astParse';
import { ESLintProgram } from 'vue-eslint-parser/ast'
import { Node } from 'vue-eslint-parser/ast/nodes'
import * as parser from 'vue-eslint-parser'

export const astParse: ASTParse = (fileInfo: FileInfo) => {
  const root : ESLintProgram = parser.parse(fileInfo.source, { filePath: fileInfo.path, sourceType: 'module' })
  const results: ParsingResultOccurrence[] = []

  parser.AST.traverseNodes(root, {
    enterNode (node: Node) {
      if (node.type === 'MemberExpression') {
        const includeRequire: boolean = node.object.type === 'Identifier' && node.object.name === 'require'
        const includeRequireContext: boolean = node.property.type === 'Identifier' && node.property.name === 'context'
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

  return results
}

export const extensions: string[] = ['.js', '.ts', '.vue']

export const parserType: ParserType = ParserType.FindRequireContextParser
