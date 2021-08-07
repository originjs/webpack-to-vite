import { vueSfcAstParser } from '@originjs/vue-sfc-ast-parser';
import { FileInfo, VueSFCContext } from '../ast-parse/astParse';
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
