import { vueSfcAstParser } from '@originjs/vue-sfc-ast-parser';
import { FileInfo, VueSFCContext } from '../ast-parse/astParse';
import getParser from 'jscodeshift/src/getParser'
import jscodeshift from 'jscodeshift'
import { readSync } from './file';

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
