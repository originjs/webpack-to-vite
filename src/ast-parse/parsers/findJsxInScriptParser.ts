import { ASTParse, ParserType } from './index';
import { FileInfo, parseVueSfc, ParsingResultOccurrence, VueSFCContext } from '../astParse';

export const astParse: ASTParse = (fileInfo: FileInfo) => {
  const context: VueSFCContext = parseVueSfc(fileInfo)
  if (!context.scriptAST || context.scriptAST.findJSXElements().length === 0) {
    return null;
  }

  const results: ParsingResultOccurrence[] = []
  context.scriptAST.findJSXElements().__paths.forEach((path) => {
    const result: ParsingResultOccurrence = {
      fileInfo: fileInfo,
      offsetBegin: path.value.start,
      offsetEnd: path.value.end,
      type: parserType
    }

    results.push(result)
  })

  return results
}

export const extensions: string[] = ['.vue']

export const parserType: ParserType = ParserType.FindJsxInScript
