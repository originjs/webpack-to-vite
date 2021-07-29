import { FileInfo, ParsingResultOccurrence } from '../astParse'

export type ASTParse<Params = void> = {
    (fileInfo: FileInfo, params: Params): ParsingResultOccurrence[] | null
}

export enum ParserType {
    // eslint-disable-next-line no-unused-vars
    FindJsxInScript = 'FindJsxInScript',
    // eslint-disable-next-line no-unused-vars
    FindRequireContextParser = 'FindRequireContextParser'
}

export const parsersMap: {
    [name: string]: {
        astParse: ASTParse,
        extensions: string[],
        parserType: ParserType
    }
} = {
  FindJsxInScript: require('./findJsxInScriptParser'),
  FindRequireContextParser: require('./findRequireContext')
}
