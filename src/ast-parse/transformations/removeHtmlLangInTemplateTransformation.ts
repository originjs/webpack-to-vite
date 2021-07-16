import type { ASTTransformation } from './index'
import { TransformationType } from './index'
import { stringifyDescriptor } from '@originjs/vue-sfc-ast-parser'
import { FileInfo, TransformationResult, VueSFCContext } from '../astParse';
import { parseVueSfc } from '../../utils/astUtils'
import { recordConver } from '../../utils/report'

export const astTransform:ASTTransformation = async (fileInfo: FileInfo) => {
  const context: VueSFCContext = parseVueSfc(fileInfo)
  if (!context.descriptor.template || !context.descriptor.template.attrs!.lang) {
    return null
  }

  if (context.descriptor.template.attrs.lang === 'html') {
    delete context.descriptor.template.attrs.lang
  }

  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: stringifyDescriptor(context.descriptor),
    type: TransformationType.removeHtmlLangInTemplateTransformation
  }
  recordConver({ num: 'O07', feat: 'remove lang="html"' })
  return result
}

export const needReparse : boolean = false

export const needWriteToOriginFile: boolean = true

export const extensions: string[] = ['.vue']

export const transformationType: TransformationType = TransformationType.removeHtmlLangInTemplateTransformation
