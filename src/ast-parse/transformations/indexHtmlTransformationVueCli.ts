import type { ASTTransformation } from './index'
import { TransformationType } from './index'
import { FileInfo, TransformationResult, TransformationParams } from '../astParse'
import { ESLintProgram } from 'vue-eslint-parser/ast'
import * as parser from 'vue-eslint-parser'
import { Node } from 'vue-eslint-parser/ast/nodes'
import { stringSplice } from '../../utils/common'
import { parseVueCliConfig } from '../../config/parse'
import path from 'path'
import fs from 'fs'

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
    indexPath = path.resolve(rootDir, 'public/index.html').replace(/\\/g, '/')
  } else if (fs.existsSync(path.resolve(rootDir, 'index.html'))) {
    indexPath = path.resolve(rootDir, 'index.html').replace(/\\/g, '/')
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

  const afterIndentLength: number = 1
  let frontIndentLength: number = 0
  let offset: number = 0

  const vueConfigFile = path.resolve(rootDir, 'vue.config.js')
  const vueConfig = await parseVueCliConfig(vueConfigFile)
  const jspRegExp = /<%(=|-)?(.|\s|\r\n)*%>/g
  const jspIdentifierRegExp = /(<%(=|-)?|\s|\r\n|%>)/g
  const jspMap = {}

  let bodyNode

  parser.AST.traverseNodes(root, {
    enterNode (node: Node) {
      // replace jsp tags
      if ((node.type === 'VLiteral' || node.type === 'VText') && jspRegExp.test(node.value)) {
        node.value.match(jspRegExp).forEach(jspSection => {
          const jspValue: string = jspSection.replace(jspIdentifierRegExp, '')
          if (!jspMap[jspSection] && jspValue === 'BASE_URL') {
            const publicPath: string =
                  process.env.PUBLIC_URL || vueConfig.publicPath || vueConfig.baseUrl || ''
            jspMap[jspSection] = path.relative(rootDir, path.resolve(rootDir, publicPath)).replace(/\\/g, '/') + '/'
          } else if (!jspMap[jspSection]) {
            jspMap[jspSection] = process.env[jspValue] ? process.env[jspValue] : ''
          }
        })
      }
      if (node.type === 'VElement' && node.name === 'body') {
        bodyNode = node
      } else if (node.type === 'VElement' && node.name === 'script') {
        const nodeAttrs = node.startTag.attributes
        // remove original entry scripts with spaces
        if (nodeAttrs[0]?.key.name === 'type' && nodeAttrs[0].value.type === 'VLiteral' && nodeAttrs[0].value.value === 'module' && nodeAttrs[1].key.name === 'src') {
          frontIndentLength = node.loc.start.column
          htmlContent = stringSplice(htmlContent, node.range[0] - frontIndentLength, node.range[1] + afterIndentLength, offset)
          offset += node.range[1] - node.range[0] + frontIndentLength + afterIndentLength + 1
        }
      }
    },
    leaveNode () {}
  })

  let transformedHtml: string = htmlContent.slice(0, bodyNode.endTag.range[0] - offset) + '{0}' + htmlContent.slice(bodyNode.endTag.range[0] - offset)
  // remove template tags
  transformedHtml = transformedHtml.slice(0, transformedHtml.length - templateEnd.length)
  transformedHtml = transformedHtml.slice(templateStart.length)

  Object.keys(jspMap).forEach(key => {
    const keyRegExp: RegExp = new RegExp(key, 'g')
    transformedHtml = transformedHtml.replace(keyRegExp, jspMap[key])
  })

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
