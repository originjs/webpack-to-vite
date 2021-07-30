import fs from 'fs'
import ejs from 'ejs'
import path from 'path'
import { writeSync } from '../utils/file'
import { TemplateData } from '../config/config'
import { RawValue } from '../config/vite'
import { recordConver } from '../utils/report'

function isObject (obj) {
  return obj !== null && (typeof obj === 'object' || typeof obj === 'function')
}

export function serializeObject (val: unknown): string {
  const seen = []

  function serializeInternal (val, pad) {
    const newLine = '\n'
    const indent = '    '
    pad = pad || ''
    const curIndent = pad + indent

    if (seen.indexOf(val) !== -1) {
      return '"[Circular]"'
    }

    if (
      typeof val === 'number' ||
      typeof val === 'boolean' ||
      typeof val === 'symbol'
    ) {
      return String(val)
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return '[]'
      }
      seen.push(val)
      const ret =
        '[' +
        newLine +
        val
          .map((el, i) => {
            if (el === null || el === undefined) {
              return ''
            } else {
              const eol = val.length - 1 === i ? newLine : ',' + newLine
              const value = serializeInternal(el, pad + indent)
              return curIndent + value + eol
            }
          })
          .join('') +
        pad +
        ']'
      seen.pop()
      return ret
    }

    if (isObject(val)) {
      if (val instanceof RawValue) {
        return val.value
      }

      const objKeys = Object.keys(val)
      if (objKeys.length === 0) {
        return '{}'
      }

      seen.push(val)
      const ret =
        '{' +
        newLine +
        objKeys
          .map((el, i) => {
            const eol = objKeys.length - 1 === i ? newLine : ',' + newLine

            const isSymbol = typeof el === 'symbol'
            const isClassic = !isSymbol && /^[a-z$_][a-z$_0-9]*$/i.test(el)
            const key = isSymbol || isClassic ? el : serializeInternal(el, pad)

            const isNull = val[el] === null
            const isUndefined = val[el] === undefined
            if (isNull || isUndefined) {
              return ''
            }

            const isFunction = typeof val[el] === 'function'
            if (isFunction) {
              const value = String(val[el])
              if (value.startsWith(el)) { // abbreviated property. e.g. additionalData() {}
                return curIndent + value + eol
              } else {
                return curIndent + String(key) + ': ' + value + eol
              }
            }

            const value = serializeInternal(val[el], pad + indent)
            return curIndent + String(key) + ': ' + value + eol
          })
          .join('') +
        pad +
        '}'
      seen.pop()
      return ret
    }

    if (val.indexOf(newLine) !== -1) {
      return `\`${val}\``
    }

    return `'${val}'`
  }

  return serializeInternal(val, '')
}

export function render (outDir: string, templatePath: string, data: TemplateData): void {
  const template = fs.readFileSync(templatePath, 'utf-8')
  const outputCode = ejs.compile(template, {})(data)
  const outputFilePath = path.resolve(outDir, 'vite.config.js')
  writeSync(outputFilePath, outputCode)
  recordConver({ num: 'B03', feat: 'add vite.config.js' })
}
