import type { FileInfo, ParsingResultOccurrence, ParsingResultProperty } from '../astParse'
import * as FindJsxInScript from './findJsxInScriptParser'
import * as FindRequireContextParser from './findRequireContext'
import * as FindWebpackConfigProperties from './findWebpackConfigProperties'
import * as FindHtmlPluginChain from './findHtmlPluginChain'
import type { PARSER_TYPES } from '../../constants/constants'

export type ASTParse<Params = void> = {
  (fileInfo: FileInfo, params: Params): ParsingResultOccurrence[] | ParsingResultProperty[][] | null
}

export type ParserType = typeof PARSER_TYPES[keyof typeof PARSER_TYPES]

export const parsersMap: {
  [name: string]: {
    astParse: ASTParse
    extensions: string[]
    parserType: ParserType
  }
} = {
  FindJsxInScript,
  FindRequireContextParser,
  FindWebpackConfigProperties,
  FindHtmlPluginChain
}
