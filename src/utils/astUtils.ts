import fs from 'fs';
import { vueSfcAstParser } from '@originjs/vue-sfc-ast-parser';
import { FileInfo, VueSFCContext } from '../ast-parse/astParse';

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
