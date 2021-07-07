import { FileInfo, ParsingResultOccurrence, ParserType } from '../astParse';

export type ASTParse<Params = void> = {
    (fileInfo: FileInfo, params: Params): ParsingResultOccurrence[] | null
}

export const parsersMap: {
    [name: string]: {
        astParse: ASTParse,
        extensions: string[],
        parserType: ParserType
    }
} = {
  FindJsxInScript: require('./findJsxInScriptParser')
}
