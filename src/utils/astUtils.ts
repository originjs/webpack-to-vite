import fs from 'fs';
import { vueSfcAstParser } from '@originjs/vue-sfc-ast-parser';
import { FileInfo, VueSFCContext } from '../ast-parse/astParse';
import getParser from 'jscodeshift/src/getParser'
import jscodeshift from 'jscodeshift'

export function parseVueSfc (fileInfo: FileInfo) : VueSFCContext {
  if (!fileInfo.source || fileInfo.source.length === 0) {
    fileInfo.source = fs.readFileSync(fileInfo.path).toString().split('\r\n').join('\n')
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
    fileInfo.source = fs.readFileSync(fileInfo.path).toString().split('\r\n').join('\n')
  }
  const parserOptions: string = lang || 'babylon'
  const parser = getParser(parserOptions)
  const jscodeshiftParser = jscodeshift.withParser(parser)
  const scriptAST = jscodeshiftParser(fileInfo.source)
  return scriptAST
}
