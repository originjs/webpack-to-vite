import type { ASTTransformation } from './index'
import { TransformationType } from './index'
import { stringifyDescriptor } from '@originjs/vue-sfc-ast-parser'
import { FileInfo, parseVueSfc, TransformationResult, VueSFCContext } from '../astParse';

export const astTransform:ASTTransformation = (fileInfo: FileInfo) => {
  const context: VueSFCContext = parseVueSfc(fileInfo)
  if (!context.descriptor.template || !context.descriptor.template.attrs!.lang) {
    return null;
  }

  if (context.descriptor.template.attrs.lang === 'html') {
    delete context.descriptor.template.attrs.lang
  }

  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: stringifyDescriptor(context.descriptor),
    type: TransformationType.removeHtmlLangInTemplateTransformation
  }
  return result;
}

export const needReparse : boolean = false

export const needWriteToOriginFile: boolean = true

export const extensions: string[] = ['.vue']

export const transformationType: TransformationType = TransformationType.removeHtmlLangInTemplateTransformation
