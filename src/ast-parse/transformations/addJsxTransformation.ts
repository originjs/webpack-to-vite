import type { ASTTransformation } from './index'
import { stringifyDescriptor } from '@originjs/vue-sfc-ast-parser'
import { FileInfo, VueSFCContext, parseVueSfc } from '../astParse';

export const transformAST:ASTTransformation = (fileInfo: FileInfo) => {
  const context: VueSFCContext = parseVueSfc(fileInfo)
  if (!context.scriptAST || context.scriptAST.findJSXElements().length === 0) {
    return null;
  }

  // if jsx element is found, the lang of script should be 'jsx'
  const descriptor = context.descriptor
  descriptor.script.attrs.lang = 'tsx'
  return stringifyDescriptor(descriptor);
}

export const needReparse: boolean = false

export const extensions: string[] = ['vue']
