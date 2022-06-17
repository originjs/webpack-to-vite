import path from 'path'
import fs from 'fs'
import { applyAstParsingResultToConfig } from '../config/parse'
import { readSync } from './file'
import { PARSER_TYPES, VUE_CONFIG_HTML_PLUGIN } from '../constants/constants'

export function getHtmlPluginConfig (vueConfig, webpackConfig, parsingResult) {
  let htmlPlugin: any
  if (webpackConfig.plugins) {
    htmlPlugin = webpackConfig.plugins.find((p: any) =>
      p.constructor.name === 'HtmlWebpackPlugin' &&
        (!p.filename || p.filename === 'index.html'))
    if (htmlPlugin) {
      htmlPlugin.options = htmlPlugin.options || htmlPlugin.userOptions
    }
  }
  // vueConfig.chainWebpack => plugin('html')
  if (vueConfig[VUE_CONFIG_HTML_PLUGIN]) {
    const htmlPluginArg = parsingResult ? applyAstParsingResultToConfig({}, PARSER_TYPES.FindHtmlConfigProperties, parsingResult) : [{}]
    try {
      vueConfig[VUE_CONFIG_HTML_PLUGIN](htmlPluginArg)
    } catch (e) {
      console.log(e)
    }
    if (!htmlPlugin) {
      htmlPlugin = {}
    }
    const { options = {} } = htmlPlugin
    const mergedOptions = Object.assign({}, options, htmlPluginArg[0])
    htmlPlugin.options = mergedOptions
  }
  return htmlPlugin
}

export function getProjectName (rootDir: string): string {
  const defaultName = 'Vite App'
  const jsonPath = path.resolve(rootDir, 'package.json')
  if (!fs.existsSync(jsonPath)) {
    return defaultName
  }
  const source = readSync(jsonPath)
  const jsonObj = JSON.parse(source)
  if (!jsonObj || !jsonObj.name) {
    return defaultName
  }
  return jsonObj.name
}
