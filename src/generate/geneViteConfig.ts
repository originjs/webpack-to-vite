import path from 'path'
import { TemplateData } from '../config/config'
import { VueCliTransformer } from '../transform/transformVuecli'
import { render, serializeObject } from './render'

export async function geneViteConfig(rootDir: string, outDir: string): Promise<void> {
  const template = path.resolve('src/template/vite.config.ejs')
  const transformer = new VueCliTransformer()
  const viteConfig = await transformer.transform(rootDir)
  const configStr = serializeObject(viteConfig)
  const data: TemplateData = {
    IMPORT_LIST: transformer.context.importList,
    USER_CONFIG: configStr,
  }

  render(outDir, template, data)
}
