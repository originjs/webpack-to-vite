import path from 'path'
import {
  geneIndexHtml,
  generateEntriesHtml,
  generateWithVueCliPublicIndex,
  getDefaultEntries,
  getEntries
} from '../src/generate/geneIndexHtml'
import { copyFileSync, mkdirSync, rmdirSync } from 'fs'
import { removeSync, writeSync, readSync } from '../src/utils/file'
import { AstParsingResult } from '../src/ast-parse/astParse'
import { TRANSFORMATION_TYPES } from '../src/constants/constants'
import { Config } from '../src/config/config'

beforeAll(() => {
  mkdirSync(path.resolve('tests/out-index-html'), { recursive: true })
})
afterAll(() => {
  rmdirSync(path.resolve('tests/out-index-html'), { recursive: true })
})

describe('geneIndexHtml', () => {
  afterEach(() => {
    removeSync(path.resolve('tests/out-index-html/index.html'))
  })

  test('geneIndexHtml from config.entry', async () => {
    const rootDir: string = path.resolve('tests/out-index-html')
    const config: Config = {
      entry: './pages/app.js'
    }
    await geneIndexHtml(rootDir, config)
    const result = readSync(path.resolve(rootDir, 'index.html'))
    expect(result).toMatch('<script type="module" src="pages/app.js"></script>')
  })

  test('geneIndexHtml from default entry', async () => {
    const rootDir: string = path.resolve('tests/out-index-html')
    const filePath = path.resolve(rootDir, 'src/main.ts')
    writeSync(filePath, '')
    await geneIndexHtml(rootDir, {})
    const result = readSync(path.resolve(rootDir, 'index.html'))
    expect(result).toMatch('<script type="module" src="/src/main.ts"></script>')
    rmdirSync(path.dirname(filePath), { recursive: true })
  })
})

describe('generateWithVueCliPublicIndex', () => {
  test('generateWithVueCliPublicIndex form none ast parsing result', () => {
    const result = generateWithVueCliPublicIndex(
      null,
      ['src/main.js'],
      'vue-cli'
    )
    expect(result).toMatch('<title>Vite App</title>')
  })

  test('generateWithVueCliPublicIndex form webpack ast parsing result', () => {
    const content = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Webpack App</title>
          </head>
          <body>
            <div id="app"></div>
            {0}
          </body>
        </html>
        `
    const astParsingResult: AstParsingResult = {
      parsingResult: {},
      transformationResult: {
        [TRANSFORMATION_TYPES.indexHtmlTransformationWebpack]: [
          {
            fileInfo: {
              path: '',
              source: ''
            },
            content: content,
            type: TRANSFORMATION_TYPES.indexHtmlTransformationVueCli
          }
        ]
      }
    }
    const result = generateWithVueCliPublicIndex(
      astParsingResult,
      ['src/main.js'],
      'webpack'
    )
    expect(result).toMatch('<title>Webpack App</title>')
  })

  test('generateWithVueCliPublicIndex form vue-cli ast parsing result', () => {
    const content = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Vue-CLI App</title>
          </head>
          <body>
            <div id="app"></div>
            {0}
          </body>
        </html>
        `
    const astParsingResult: AstParsingResult = {
      parsingResult: {},
      transformationResult: {
        [TRANSFORMATION_TYPES.indexHtmlTransformationVueCli]: [
          {
            fileInfo: {
              path: '',
              source: ''
            },
            content: content,
            type: TRANSFORMATION_TYPES.indexHtmlTransformationVueCli
          }
        ]
      }
    }
    const result = generateWithVueCliPublicIndex(
      astParsingResult,
      ['src/main.js'],
      'vue-cli'
    )
    expect(result).toMatch('<title>Vue-CLI App</title>')
  })
})

describe('getEntries', () => {
  test('getEntries from string', () => {
    const result = getEntries(path.resolve('tests/out-index-html'), './main.js')
    expect(result).toEqual(['main.js'])
  })

  test('getEntries from array', () => {
    const result = getEntries(path.resolve('tests/out-index-html'), [
      './app1.js',
      './app2.js'
    ])
    expect(result).toEqual(['app1.js', 'app2.js'])
  })

  test('getEntries from object', () => {
    const result = getEntries(path.resolve('tests/out-index-html'), {
      app1: './app1.js',
      subPage1: ['./pages/sub1.js', './pages/sub2.js'],
      subPage2: {
        a3: './pages/sub3.js',
        a4: './pages/sub4.js'
      }
    })
    expect(result).toEqual([
      'app1.js',
      'pages/sub1.js',
      'pages/sub2.js',
      'pages/sub3.js',
      'pages/sub4.js'
    ])
  })

  test('getEntries from function', () => {
    const result = getEntries(
      path.resolve('tests/out-index-html'),
      () => './main.js'
    )
    expect(result).toEqual(['./main.js'])
  })

  test('getEntries contain webpack-hot-middleware', () => {
    const result = getEntries(path.resolve('tests/out-index-html'), {
      app: ['./build/dev-client', './app.js']
    })
    expect(result).toEqual(['app.js'])
  })
})

describe('getDefaultEntries', () => {
  test('getDefaultEntries from vue.config.js', async () => {
    const srcPath = path.resolve('tests/testdata/index-html/vue.config.js')
    const destPath = path.resolve('tests/out-index-html/vue.config.js')
    copyFileSync(srcPath, destPath)
    const result = await getDefaultEntries(
      path.resolve('tests/out-index-html'),
      'vue-cli'
    )
    expect(result).toEqual(['pages/app1.js', 'pages/app2.js'])
    removeSync(destPath)
  })

  test('getDefaultEntries from src/main.ts', async () => {
    const filePath = path.resolve('tests/out-index-html/src/main.ts')
    writeSync(filePath, '')
    const result = await getDefaultEntries(
      path.resolve('tests/out-index-html'),
      'vue-cli'
    )
    expect(result).toEqual(['/src/main.ts'])
    removeSync(filePath)
  })

  test('getDefaultEntries from src/main.js', async () => {
    const filePath = path.resolve('tests/out-index-html/src/main.js')
    writeSync(filePath, '')
    const result = await getDefaultEntries(
      path.resolve('tests/out-index-html'),
      'vue-cli'
    )
    expect(result).toEqual(['/src/main.js'])
    removeSync(filePath)
  })
})

test('generateEntriesHtml', () => {
  const entries: string[] = ['pages/app1.js', 'pages/app2.js']
  const result: string = generateEntriesHtml(entries)
  expect(result).toBe(
    '  <script type="module" src="pages/app1.js"></script>\n' +
      '  <script type="module" src="pages/app2.js"></script>\n'
  )
})
