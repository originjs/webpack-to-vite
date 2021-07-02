import type { ASTTransformation } from './index'
import { Context } from './index'
import { stringifyDescriptor } from '@originjs/vue-sfc-ast-parser'

export const transformAST:ASTTransformation = (context: Context) => {
  if (!context.descriptor.template || !context.descriptor.template.attrs!.lang) {
    return null;
  }

  if (context.descriptor.template.attrs.lang === 'html') {
    delete context.descriptor.template.attrs.lang
  }
  return stringifyDescriptor(context.descriptor);
}

export const needReparse : boolean = false

export const extensions: string[] = ['vue']
