import type { ASTTransformation, TransformationType } from './index'
import { TRANSFORMATION_TYPES } from '../../constants/constants'
import { stringifyDescriptor } from '@originjs/vue-sfc-ast-parser'
import type { FileInfo, VueSFCContext, TransformationResult } from '../astParse'
import { parseVueSfc } from '../../utils/astUtils'

export const astTransform: ASTTransformation = async (fileInfo: FileInfo) => {
  const context: VueSFCContext = parseVueSfc(fileInfo)
  if (!context.scriptAST || context.scriptAST.findJSXElements().length === 0) {
    return null
  }

  // if jsx element is found, the lang of script should be 'jsx'
  const descriptor = context.descriptor
  descriptor.script.attrs.lang = 'tsx'
  const result: TransformationResult = {
    fileInfo: fileInfo,
    content: stringifyDescriptor(descriptor),
    type: TRANSFORMATION_TYPES.addJsxTransformation
  }
  return result
}

export const needReparse: boolean = false

export const needWriteToOriginFile: boolean = true

export const extensions: string[] = ['.vue']

export const transformationType: TransformationType =
  TRANSFORMATION_TYPES.addJsxTransformation
