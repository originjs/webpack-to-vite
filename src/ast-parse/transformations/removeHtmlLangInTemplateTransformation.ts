import type { ASTTransformation } from './index'
import { stringifyDescriptor } from '@originjs/vue-sfc-ast-parser'
import { FileInfo, parseVueSfc, VueSFCContext } from '../astParse';

export const astTransform:ASTTransformation = (fileInfo: FileInfo) => {
  const context: VueSFCContext = parseVueSfc(fileInfo)
  if (!context.descriptor.template || !context.descriptor.template.attrs!.lang) {
    return null;
  }

  if (context.descriptor.template.attrs.lang === 'html') {
    delete context.descriptor.template.attrs.lang
  }
  return stringifyDescriptor(context.descriptor);
}

export const needReparse : boolean = false

export const extensions: string[] = ['.vue']
