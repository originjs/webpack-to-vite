import path from 'path'
import type { Config, TemplateData } from '../config/config'
import { getTransformer } from '../transform/transformer'
import { render, serializeObject } from './render'
import type { AstParsingResult } from '../ast-parse/astParse'

export async function geneViteConfig (rootDir: string, outDir: string, config: Config, astParsingResult?: AstParsingResult): Promise<void> {
  const template = path.resolve(__dirname, '../template/vite.config.ejs')
  const transformer = getTransformer(config.projectType)
  const viteConfig = await transformer.transform(rootDir, astParsingResult, outDir)
  const configStr = serializeObject(viteConfig)
  const data: TemplateData = {
    IMPORT_LIST: transformer.context.importers,
    USER_CONFIG: configStr
  }

  render(outDir, template, data)
}
