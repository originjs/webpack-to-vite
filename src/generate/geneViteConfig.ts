import path from 'path'
import { Config, TemplateData } from '../config/config'
import { getTransformer } from '../transform/transformer'
import { render, serializeObject } from './render'

export async function geneViteConfig (rootDir: string, outDir: string, config: Config): Promise<void> {
  const template = path.resolve('src/template/vite.config.ejs')
  const transformer = getTransformer(config.projectType)
  const viteConfig = await transformer.transform(rootDir)
  const configStr = serializeObject(viteConfig)
  const data: TemplateData = {
    IMPORT_LIST: transformer.context.importers,
    USER_CONFIG: configStr
  }
  // fill entry
  if (config.entry === undefined) {
    config.entry = transformer.context.config.build.rollupOptions.input
  }

  render(outDir, template, data)
}
