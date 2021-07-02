import type { ASTTransformation } from './index'
import { Context } from './index'
import { stringifyDescriptor } from '@originjs/vue-sfc-ast-parser'

export const transformAST:ASTTransformation = (context: Context) => {
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
