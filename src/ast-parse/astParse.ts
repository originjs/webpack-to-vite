import { Context, transformationMap } from './transformations/index'
import { vueSfcAstParser } from '@originjs/vue-sfc-ast-parser'
import * as globby from 'globby'
import fs from 'fs'

export function astParseRoot (rootDir: string) {
  const resolvedPaths : string[] = globby.sync(rootDir)
  resolvedPaths.forEach(filePath => {
    // skip files in node_modules
    if (filePath.indexOf('/node_modules/') >= 0) {
      return
    }

    const extension = (/\.([^.]*)$/.exec(filePath) || [])[0]

    let fileChanged: boolean = false
    let context = parseVueSfc(filePath)
    let transformationResult: string = context.source
    let tempTransformationResult: string|null

    // iter all transformations
    for (const key in transformationMap) {
      const transformation = transformationMap[key]

      // filter by file extension
      const extensions: string[] = transformation.extensions
      if (!extensions.includes(extension)) {
        continue
      }

      // execute the transformation
      tempTransformationResult = transformation.transformAST(context)
      if (tempTransformationResult == null) {
        continue
      }
      fileChanged = true
      transformationResult = tempTransformationResult

      if (transformation.needReparse) {
        context = parseVueSfc(filePath, transformationResult)
      }
    }
    if (fileChanged) {
      fs.writeFileSync(filePath, transformationResult)
    }
  })
}

function parseVueSfc (filePath: string, source?: string) : Context {
  if (!source || source.length === 0) {
    source = fs.readFileSync(filePath).toString().split('\r\n').join('\n')
  }
  const fileInfo = {
    path: filePath,
    source: source
  }
  const astParseResult = vueSfcAstParser(fileInfo)
  const context : Context = {
    path: filePath,
    source: source,
    templateAST: astParseResult.templateAST,
    scriptAST: astParseResult.scriptAST,
    jscodeshiftParser: astParseResult.jscodeshiftParser,
    descriptor: astParseResult.descriptor
  }

  return context
}
