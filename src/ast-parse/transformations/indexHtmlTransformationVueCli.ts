import path from 'path'
import { existsSync } from 'fs'
import type {
  ESLintProgram,
  VAttribute,
  VDirective
} from 'vue-eslint-parser/ast'
import * as parser from 'vue-eslint-parser'
import type { Node } from 'vue-eslint-parser/ast/nodes'
import type { Configuration } from 'webpack'
import type { ASTTransformation, TransformationType } from './index'
import { TRANSFORMATION_TYPES, VUE_CONFIG_HTML_PLUGIN } from '../../constants/constants'
import type {
  FileInfo,
  TransformationResult,
  TransformationParams,
  ParsingResult
} from '../astParse'
import { stringSplice } from '../../utils/common'
import { recordConver } from '../../utils/report'
import { pathFormat } from '../../utils/file'
import { parseVueCliConfig, applyAstParsingResultToConfig } from '../../config/parse'

const templateStart: string = '<template>'
const templateEnd: string = '</template>'

export const astTransform: ASTTransformation = async (
  fileInfo: FileInfo,
  transformationParams?: TransformationParams,
  parsingResult?: ParsingResult
) => {
  if (!transformationParams) {
    return null
  }

  if (transformationParams.config.projectType === 'webpack') {
    return null
  }

  const rootDir: string = transformationParams.config.rootDir
  const vueConfigPath = existsSync(path.resolve(rootDir, 'vue.temp.config.ts')) ? path.resolve(rootDir, 'vue.temp.config.ts') : path.resolve(rootDir, 'vue.temp.config.js')
  const vueConfig = await parseVueCliConfig(vueConfigPath)
  // vueConfig.configureWebpack
  let webpackConfig: Configuration = {}
  if (vueConfig.configureWebpack && typeof vueConfig.configureWebpack !== 'function') {
    webpackConfig = vueConfig.configureWebpack
  } else if (vueConfig.configureWebpack) {
    try {
      webpackConfig = applyAstParsingResultToConfig(webpackConfig, 'FindWebpackConfigAttrs', parsingResult)
      vueConfig.configureWebpack(webpackConfig)
    } catch (e) {
      console.log(e.message)
    }
  }

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
    const htmlPluginArgs = [{}]
    vueConfig[VUE_CONFIG_HTML_PLUGIN](htmlPluginArgs)
    const htmlPluginFromChainWebpack = {
      options: htmlPluginArgs[0]
    }
    htmlPlugin = {}
    Object.assign(htmlPlugin, htmlPluginFromChainWebpack)
  }

  let indexPath: string
  if (htmlPlugin && htmlPlugin.options?.template) {
    indexPath = webpackConfig.context
      ? path.resolve(rootDir, webpackConfig.context, htmlPlugin.options.template)
      : path.resolve(rootDir, htmlPlugin.options.template)
  } else if (existsSync(path.resolve(rootDir, 'public/index.html'))) {
    indexPath = path.resolve(rootDir, 'public/index.html')
  } else if (existsSync(path.resolve(rootDir, 'index.html'))) {
    indexPath = path.resolve(rootDir, 'index.html')
  } else {
    indexPath = null
  }
  if (
    !indexPath ||
    !pathFormat(fileInfo.path).endsWith(pathFormat(indexPath))
  ) {
    return null
  }

  // add template tags for vue-eslint-parser
  let htmlContent
  if (htmlPlugin && htmlPlugin.options?.templateContent) {
    htmlContent = typeof htmlPlugin.options.templateContent === 'function'
      ? `${templateStart}${htmlPlugin.options.templateContent()}${templateEnd}`
      : `${templateStart}${htmlPlugin.options.templateContent}${templateEnd}`
  } else {
    htmlContent = `${templateStart}${fileInfo.source}${templateEnd}`
  }
  const htmlAST: ESLintProgram = parser.parse(htmlContent, {
    sourceType: 'module'
  })
  const root: Node = htmlAST.templateBody
  const behindIndentLength: number = 1
  let frontIndentLength: number = 0

  parser.AST.traverseNodes(root, {
    enterNode (node: Node) {
      if (node.type === 'VElement' && node.name === 'script') {
        const nodeAttrs: (VAttribute | VDirective)[] = node.startTag.attributes
        const entryNodeIsFound: boolean = nodeAttrs.some(
          (attr) =>
            attr.key.name === 'type' &&
            attr.value.type === 'VLiteral' &&
            attr.value.value === 'module'
        )
        const entryFileIsFound: boolean = nodeAttrs.some(
          (attr) =>
            attr.key.name === 'src' &&
            attr.value.type === 'VLiteral' &&
            existsSync(path.resolve(rootDir, attr.value.value))
        )
        // remove original entry scripts with spaces
        if (entryNodeIsFound && entryFileIsFound) {
          frontIndentLength = node.loc.start.column
          const nodeStart: number = node.range[0] - frontIndentLength
          const nodeEnd: number = node.range[1] + behindIndentLength
          htmlContent = stringSplice(htmlContent, nodeStart, nodeEnd)
        }
      }
    },
    leaveNode () {}
  })

  const newRoot: Node = parser.parse(htmlContent, {
    sourceType: 'module'
  }).templateBody
  let bodyNode
  parser.AST.traverseNodes(newRoot, {
    enterNode (node: Node) {
      if (node.type === 'VElement' && node.name === 'body') {
        bodyNode = node
      }
    },
    leaveNode () {}
  })

  let transformedHtml: string =
    htmlContent.slice(0, bodyNode.endTag.range[0]) +
    '{0}' +
    htmlContent.slice(bodyNode.endTag.range[0])
  // remove template tags
  transformedHtml = transformedHtml.slice(
    0,
    transformedHtml.length - templateEnd.length
  )
  transformedHtml = transformedHtml.slice(templateStart.length)

  // TODO: default values exposed by plugins and client-side env variables
  // replace variable name with `process.env['variableName']`
  const globalVariableReg: RegExp = /VUE_APP_\w+/g
  const globalVariableNameSet: Set<string> = new Set(
    transformedHtml.match(globalVariableReg) || []
  )
  const globalVariableNames: string[] = [
    'BASE_URL',
    'NODE_ENV',
    ...Array.from(globalVariableNameSet)
  ]
  globalVariableNames.forEach((variableName) => {
    const replacementReg: RegExp = new RegExp(variableName, 'g')
    transformedHtml = transformedHtml.replace(
      replacementReg,
      `process.env['${variableName}']`
    )
  })

  // use vite-plugin-html to replace html-webpack-plugin
  transformedHtml = transformedHtml.replace(/htmlWebpackPlugin.(options|files)./g, '')

  recordConver({ num: 'V06', feat: 'client-side env variables' })

  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: transformedHtml,
    type: TRANSFORMATION_TYPES.indexHtmlTransformationVueCli
  }

  return result
}

export const needReparse: boolean = false

export const needWriteToOriginFile: boolean = false

export const extensions: string[] = ['.html']

export const transformationType: TransformationType =
  TRANSFORMATION_TYPES.indexHtmlTransformationVueCli
