import path from 'path'
import { TemplateData } from '../config/config'
import { getTransformer } from '../transform/transformer'
import { render, serializeObject } from './render'

export async function geneViteConfig (rootDir: string, outDir: string, projectType: string): Promise<void> {
  const template = path.resolve('src/template/vite.config.ejs')
  const transformer = getTransformer(projectType)
  const viteConfig = await transformer.transform(rootDir)
  const configStr = serializeObject(viteConfig)
  const data: TemplateData = {
    IMPORT_LIST: transformer.context.importers,
    USER_CONFIG: configStr
  }

  render(outDir, template, data)
}
