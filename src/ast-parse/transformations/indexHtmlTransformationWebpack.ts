import path from 'path'
import fs from 'fs'
import type {
  ESLintProgram,
  VAttribute,
  VDirective
} from 'vue-eslint-parser/ast'
import * as parser from 'vue-eslint-parser'
import type { Node } from 'vue-eslint-parser/ast/nodes'
import type { ASTTransformation, TransformationType } from './index'
import { TRANSFORMATION_TYPES } from '../../constants/constants'
import type {
  FileInfo,
  TransformationResult,
  TransformationParams
} from '../astParse'
import { stringSplice } from '../../utils/common'
import { pathFormat } from '../../utils/file'
import { parseWebpackConfig } from '../../config/parse'

const templateStart: string = '<template>'
const templateEnd: string = '</template>'

export const astTransform: ASTTransformation = async (
  fileInfo: FileInfo,
  transformationParams?: TransformationParams
) => {
  if (!transformationParams) {
    return null
  }

  if (transformationParams.config.projectType !== 'webpack') {
    return null
  }

  const rootDir: string = transformationParams.config.rootDir
  const webpackConfig = await parseWebpackConfig(path.resolve(rootDir, 'webpack.config.js'))
  let htmlPlugin: any
  if (webpackConfig.plugins) {
    htmlPlugin = webpackConfig.plugins.find((p: any) =>
      p.constructor.name === 'HtmlWebpackPlugin' &&
    (!p.filename || p.filename === 'index.html'))
    if (htmlPlugin) {
      htmlPlugin.options = htmlPlugin.options || htmlPlugin.userOptions
    }
  }
  let indexPath: string
  if (htmlPlugin && htmlPlugin.options?.template) {
    indexPath = webpackConfig.context
      ? path.resolve(rootDir, webpackConfig.context, htmlPlugin.options.template)
      : path.resolve(rootDir, htmlPlugin.options.template)
  } else if (fs.existsSync(path.resolve(rootDir, 'index.html'))) {
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

  let htmlContent
  // add template tags for vue-eslint-parser
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
            fs.existsSync(path.resolve(rootDir, attr.value.value))
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

  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: transformedHtml,
    type: TRANSFORMATION_TYPES.indexHtmlTransformationWebpack
  }

  return result
}

export const needReparse: boolean = false

export const needWriteToOriginFile: boolean = false

// TODO: .aspx
export const extensions: string[] = ['.html', '.ejs']

export const transformationType: TransformationType =
  TRANSFORMATION_TYPES.indexHtmlTransformationWebpack
