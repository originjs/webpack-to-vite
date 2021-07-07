import { FileInfo, ParsingResultOccurrence } from '../astParse';

export enum ParserType {
    // eslint-disable-next-line no-unused-vars
    FindJsxInScript = 'FindJsxInScript'
}

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
