import path from 'path'
import { existsSync } from 'fs'
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
import { recordConver } from '../../utils/report'
import { pathFormat } from '../../utils/file'

const templateStart: string = '<template>'
const templateEnd: string = '</template>'

export const astTransform: ASTTransformation = async (
  fileInfo: FileInfo,
  transformationParams?: TransformationParams
) => {
  if (!transformationParams && !transformationParams.config.rootDir) {
    return null
  }

  if (transformationParams.config.projectType === 'webpack') {
    return null
  }

  const rootDir: string = transformationParams.config.rootDir

  const { htmlPlugin, context } = transformationParams
  let indexPath: string
  if (htmlPlugin && htmlPlugin.options?.template) {
    indexPath = context
      ? path.resolve(rootDir, context, htmlPlugin.options.template)
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

  recordConver({ num: 'V06', feat: 'client-side env variables' })

  // use vite-plugin-html to replace html-webpack-plugin
  transformedHtml = transformedHtml.replace(/htmlWebpackPlugin.(options|files)./g, '')

  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: transformedHtml,
    type: TRANSFORMATION_TYPES.indexHtmlTransformationVueCli
  }

  return result
}

export const needReparse: boolean = false

export const needWriteToOriginFile: boolean = false

export const extensions: string[] = ['.html', '.ejs']

export const transformationType: TransformationType =
  TRANSFORMATION_TYPES.indexHtmlTransformationVueCli
