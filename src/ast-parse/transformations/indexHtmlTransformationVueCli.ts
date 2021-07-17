import type { ASTTransformation } from './index'
import { TransformationType } from './index'
import { FileInfo, TransformationResult, TransformationParams } from '../astParse'
import { ESLintProgram } from 'vue-eslint-parser/ast'
import * as parser from 'vue-eslint-parser'
import { Node } from 'vue-eslint-parser/ast/nodes'
import { stringSplice } from '../../utils/common'
import { pathFormat } from '../../utils/file'
import { parseVueCliConfig } from '../../config/parse'
import path from 'path'
import fs from 'fs'
import ejs from 'ejs'

const templateStart: string = '<template>'
const templateEnd: string = '</template>'

export const astTransform:ASTTransformation = async (fileInfo: FileInfo, transformationParams?: TransformationParams) => {
  if (!transformationParams) {
    return null
  }

  if (transformationParams.config.projectType === 'webpack') {
    return null
  }

  const rootDir: string = transformationParams.config.rootDir
  let indexPath: string
  if (fs.existsSync(path.resolve(rootDir, 'public/index.html'))) {
    indexPath = pathFormat(path.resolve(rootDir, 'public/index.html'))
  } else if (fs.existsSync(path.resolve(rootDir, 'index.html'))) {
    indexPath = pathFormat(path.resolve(rootDir, 'index.html'))
  } else {
    indexPath = null
  }
  if (!indexPath || !fileInfo.path.endsWith(indexPath)) {
    return null
  }

  // add template tags for vue-eslint-parser
  let htmlContent = `${templateStart}${fileInfo.source}${templateEnd}`
  const htmlAST : ESLintProgram = parser.parse(htmlContent, { sourceType: 'module' })
  const root: Node = htmlAST.templateBody

  const behindIndentLength: number = 1
  let frontIndentLength: number = 0
  let offset: number = 0

  const vueConfigFile = path.resolve(rootDir, 'vue.config.js')
  const vueConfig = await parseVueCliConfig(vueConfigFile)
  const publicPath: string = process.env.PUBLIC_URL || vueConfig.publicPath || vueConfig.baseUrl || ''
  // TODO: defaut values exposed by plugins and client-side env variables
  const jspData = {
    BASE_URL: publicPath,
    NODE_ENV: '',
    ...process.env
  }

  let bodyNode

  parser.AST.traverseNodes(root, {
    enterNode (node: Node) {
      if (node.type === 'VElement' && node.name === 'body') {
        bodyNode = node
      } else if (node.type === 'VElement' && node.name === 'script') {
        const nodeAttrs = node.startTag.attributes

        // remove original entry scripts with spaces
        if (nodeAttrs[0]?.key.name === 'type' && nodeAttrs[0].value.type === 'VLiteral' && nodeAttrs[0].value.value === 'module' && nodeAttrs[1].key.name === 'src') {
          frontIndentLength = node.loc.start.column
          const nodeStart: number = node.range[0] - frontIndentLength
          const nodeEnd: number = node.range[1] + behindIndentLength
          htmlContent = stringSplice(htmlContent, nodeStart, nodeEnd, offset)
          offset += node.range[1] - node.range[0] + frontIndentLength + behindIndentLength + 1
        }
      }
    },
    leaveNode () {}
  })

  let transformedHtml: string = htmlContent.slice(0, bodyNode.endTag.range[0] - offset) + '{0}' + htmlContent.slice(bodyNode.endTag.range[0] - offset)
  // remove template tags
  transformedHtml = transformedHtml.slice(0, transformedHtml.length - templateEnd.length)
  transformedHtml = transformedHtml.slice(templateStart.length)

  // replace jsp tags
  transformedHtml = ejs.compile(transformedHtml, {})(jspData)

  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: transformedHtml,
    type: TransformationType.removeHtmlLangInTemplateTransformation
  }

  return result
}

export const needReparse: boolean = false

export const needWriteToOriginFile: boolean = false

export const extensions: string[] = ['.html']

export const transformationType: TransformationType = TransformationType.indexHtmlTransformationVueCli
