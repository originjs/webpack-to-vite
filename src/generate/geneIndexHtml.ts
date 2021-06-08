import fs from 'fs'
import path from 'path'
import { readSync, writeSync } from '../utils/file'

export function genIndexHtml(root: string): void {
  const filePath = path.resolve(root, 'index.html')
  let htmlContent
  if (fs.existsSync(filePath)) {
    htmlContent = readSync(filePath)
  } else {
    htmlContent = readSync(path.resolve(path.resolve('src/template/index.html')))
  }
  const entries = getVuecliEntries(root)
  const injectedContent = injectHtml(htmlContent, entries)
  writeSync(filePath, injectedContent)
}

export function injectHtml(source: string, entries: string[]): string {
  const bodyRegex = /<body[^>]*>((.|[\n\r])*)<\/body>/im
  let body = '  <body>\n'
  body += '    <div id="app"></div>\n'
  for (const entry of entries) {
    body += `<script type="module" src="${entry}"></script>\n`
  }
  body += '  </body>'
  const result = source.replace(bodyRegex, body)
  return result
}

function getVuecliEntries(root: string): string[] {
  const entries = []
  const mainFile = path.resolve(root, 'src/main.ts')
  if (fs.existsSync(mainFile)) {
    entries.push('/src/main.ts')
  } else {
    entries.push('/src/main.js')
  }
  // TODO: vue-cli pages config
  return entries
}

