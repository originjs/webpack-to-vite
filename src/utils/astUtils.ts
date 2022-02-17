import getParser from 'jscodeshift/src/getParser'
import jscodeshift from 'jscodeshift'
import { vueSfcAstParser } from '@originjs/vue-sfc-ast-parser'
import type { FileInfo, ParsingResultProperty, VueSFCContext } from '../ast-parse/astParse'
import { readSync } from './file'

export function parseVueSfc (fileInfo: FileInfo) : VueSFCContext {
  if (!fileInfo.source || fileInfo.source.length === 0) {
    fileInfo.source = readSync(fileInfo.path).replace(/\r\n/g, '\n')
  }
  const astParseResult = vueSfcAstParser(fileInfo)
  const context : VueSFCContext = {
    path: fileInfo.path,
    source: fileInfo.source,
    templateAST: astParseResult.templateAST,
    scriptAST: astParseResult.scriptAST,
    jscodeshiftParser: astParseResult.jscodeshiftParser,
    descriptor: astParseResult.descriptor
  }

  return context
}

export function parseScriptSfc (fileInfo: FileInfo, lang?: string) : any {
  if (!fileInfo.source || fileInfo.source.length === 0) {
    fileInfo.source = readSync(fileInfo.path).replace(/\r\n/g, '\n')
  }
  const parserOptions: string = lang || 'babylon'
  const parser = getParser(parserOptions)
  const jscodeshiftParser = jscodeshift.withParser(parser)
  const scriptAST = jscodeshiftParser(fileInfo.source)
  return scriptAST
}

// In order to get properties of `config` from declaration statement, capture
// node whose type is identifier and collect their names as result
// eg: `config.resolve.alias = {}` -> [{ type: 'object', name: 'resolve'}, { type: 'object', name: 'alias'}]
export function parseIdentifierFromBodyNodes (bodyNodes: any[], paramName: string): ParsingResultProperty[][] {
  const identifierResult = []

  const getTypeName = (type: string) => {
    if (type === 'CallExpression') {
      return 'function'
    } else if (type === 'MemberExpression' || type === 'StringLiteral') {
      return 'object'
    } else if (type === 'NumericLiteral') {
      return 'index'
    } else {
      return ''
    }
  }

  const getIdentifier = ({ node, type, attrs }): boolean => {
    if (node.type === 'MemberExpression' && node.object.type === 'Identifier') {
      // return whether this property belongs to `config`
      if (node.object.name === paramName) {
        if (node.property.type === 'Identifier') {
          attrs.push({ name: node.property.name, type: getTypeName(type) })
        } else if (node.property.type === 'StringLiteral') {
          attrs.push({ name: node.property.value, type: getTypeName(type) })
        } else if (node.property.type === 'NumericLiteral') {
          attrs.push({ name: node.property.value, type: getTypeName(node.property.type) })
        }
        return true
      } else {
        return false
      }
    } else if (node.type === 'MemberExpression') {
      // nested property
      if (getIdentifier({ node: node.object, type: node.object.type, attrs })) {
        if (node.property.type === 'Identifier') {
          attrs.push({ name: node.property.name, type: getTypeName(type) })
        } else if (node.property.type === 'StringLiteral') {
          attrs.push({ name: node.property.value, type: getTypeName(type) })
        } else if (node.property.type === 'NumericLiteral') {
          attrs.push({ name: node.property.value, type: getTypeName(node.property.type) })
        }
        return true
      } else {
        return false
      }
    } else if (node.type === 'CallExpression') {
      // function declaration from nested property
      return getIdentifier({ node: node.callee, type: 'CallExpression', attrs })
    } else if (node.type === 'ExpressionStatement' &&
      node.expression.type === 'AssignmentExpression' &&
      node.expression.left.type === 'MemberExpression'
    ) {
      // statement like `config.key = ...`
      return getIdentifier({ node: node.expression.left, type: node.expression.left.type, attrs })
    } else if (node.type === 'ExpressionStatement' &&
      node.expression.type === 'CallExpression'
    ) {
      // function declaration
      return getIdentifier({ node: node.expression.callee, type: 'CallExpression', attrs })
    } else if (node.type === 'IfStatement' && node.consequent.type === 'BlockStatement') {
      // statement like `if () else {}`
      node.consequent.body.forEach(bodyNode => {
        const payload = {
          node: bodyNode,
          type: bodyNode.type,
          attrs: []
        }
        getIdentifier(payload)
        if (payload.attrs.length) {
          identifierResult.push(payload.attrs)
        }
      })
      return true
    }
    return false
  }

  bodyNodes.forEach(node => {
    const payload = {
      node: node,
      type: node.type,
      attrs: []
    }
    getIdentifier(payload)
    if (payload.attrs.length) {
      identifierResult.push(payload.attrs)
    }
  })

  return identifierResult
}
