import {copyDirSync, readSync, removeSync, renameSync, writeSync} from '../src/utils/file';
import path from "path";
import {
    astParseRoot,
    AstParsingResult,
    ParsingResultOccurrence,
    FileInfo,
    TransformationParams,
    TransformationResult,
    ParsingResultProperty
} from '../src/ast-parse/astParse'
import { Config } from '../src/config/config'
import fs from "fs";
import {astTransform as addJsxTransform} from "../src/ast-parse/transformations/addJsxTransformation";
import {astTransform as removeHtmlLangTransform} from "../src/ast-parse/transformations/removeHtmlLangInTemplateTransformation";
import {astTransform as indexHtmlVueCliTransform} from "../src/ast-parse/transformations/indexHtmlTransformationVueCli";
import {astTransform as indexHtmlWebpackTransform} from "../src/ast-parse/transformations/indexHtmlTransformationWebpack";
import {astTransform as lazyLoadingRoutesTransform} from "../src/ast-parse/transformations/lazyLoadingRoutesTransformation";
import {astTransform as chainWebpackTransformation} from '../src/ast-parse/transformations/chainWebpackTransformation';
import { astParse as findJsxInScriptParser } from '../src/ast-parse/parsers/findJsxInScriptParser'
import { astParse as findRequireContext } from '../src/ast-parse/parsers/findRequireContext'
import { astParse as findWebpackConfigProperties } from '../src/ast-parse/parsers/findWebpackConfigProperties';
import { astParse as findChainWebpackConfigProperties } from '../src/ast-parse/parsers/findChainWebpackConfigProperties';
import { ParsingResult } from '../src/ast-parse/astParse';

const parsingResult: ParsingResult = {}

beforeAll(() => {
    const srcPath = path.resolve('tests/testdata/ast-parse')
    const destPath = path.resolve('tests/out-ast-parse')
    copyDirSync(srcPath, destPath)
})
afterAll(() => {
    fs.rmdirSync(path.resolve('tests/out-ast-parse'), { recursive: true })
})

test('addJsxTransformation', async () => {
    const filePath: string = path.resolve('tests/out-ast-parse/addJsx.vue')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const config: TransformationParams = {
        config: {
            rootDir: filePath
        }
    }
    const result = await addJsxTransform(fileInfo, config, null)
    expect(result.content).toContain('lang="tsx"')
})

test('removeHtmlLangInTemplateTransformation', async () => {
    const filePath: string = path.resolve('tests/out-ast-parse/removeHtmlLang.vue')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const config: TransformationParams = {
        config: {
            rootDir: filePath
        }
    }
    const result = await removeHtmlLangTransform(fileInfo, config, null)
    expect(result.content).not.toContain('lang="html"')
})

test('findWebpackConfigProperties',  () => {
    const filePath: string = path.resolve('tests/out-ast-parse/vue.config.js')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const result = findWebpackConfigProperties(fileInfo) as ParsingResultProperty[][]
    expect(result.length).toBe(2)
    expect(result[0]).toMatchObject([{ name: 'resolve', type: 'object' }])
    expect(result[1]).toMatchObject([
        { name: 'plugins', type: 'object' },  
        { name: 'push', type: 'function' }    
    ])
    parsingResult['FindWebpackConfigProperties'] = result
})

test('findChainWebpackConfigProperties',  () => {
    const filePath: string = path.resolve('tests/out-ast-parse/vue.config.js')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const result = findChainWebpackConfigProperties(fileInfo) as ParsingResultOccurrence[] | null
    expect(result.length).toBe(3)
    // line number of chainWebpack node
    expect(result[0].offsetBegin).toBe(37)
    // line number of config.plugin('html') node
    expect(result[1].offsetBegin).toBe(41)
    // line number of config.plugin('html') node block
    expect(result[2].offsetBegin).toBe(41)
    parsingResult['FindChainWebpackConfigProperties'] = result
})

test('indexHtmlTransformationVueCli', async () => {
    const oldFilePath: string = path.resolve('tests/out-ast-parse/vue-cli-index.html')
    const filePath: string = path.resolve('tests/out-ast-parse/index.html')
    renameSync(oldFilePath, filePath)
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const rootDir: string = path.dirname(filePath)
    const transformationParams: TransformationParams = {
        config: {
            rootDir: rootDir,
            projectType: 'vue-cli'
        }
    }
    const mainJsPath = path.resolve(rootDir, 'src/main.js')
    writeSync(mainJsPath, '')
    const result: TransformationResult = await indexHtmlVueCliTransform(fileInfo, transformationParams, null)
    expect(result.content).not.toMatch('<script type="module" src="src/main.js"></script>')
    expect(result.content).toMatch('{0}')
    expect(result.content).toMatch(`process.env['BASE_URL']`)
    expect(result.content).toMatch(`process.env['NODE_ENV']`)
    expect(result.content).toMatch(`process.env['VUE_APP_ICON']`)
    expect(result.content).toMatch(`<title><%= title %></title>`)
    removeSync(filePath)
    removeSync(mainJsPath)
})

test('indexHtmlTransformationWebpack', async () => {
    const oldFilePath: string = path.resolve('tests/out-ast-parse/webpack-index.html')
    const filePath: string = path.resolve('tests/out-ast-parse/index.html')
    renameSync(oldFilePath, filePath)
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const rootDir: string = path.dirname(filePath)
    const transformationParams: TransformationParams = {
        config: {
            rootDir: rootDir,
            projectType: 'webpack'
        }
    }
    const mainJsPath = path.resolve(rootDir, 'src/main.js')
    writeSync(mainJsPath, '')
    const result: TransformationResult = await indexHtmlWebpackTransform(fileInfo, transformationParams, null)
    expect(result.content).not.toMatch('<script type="module" src="src/main.js"></script>')
    expect(result.content).toMatch('{0}')
    expect(result.content).toMatch(`process.env['BASE_URL']`)
    expect(result.content).toMatch(`process.env['NODE_ENV']`)
    expect(result.content).toMatch(`process.env['VUE_APP_ICON']`)
    expect(result.content).toMatch(`<title><%= title %></title>`)
    removeSync(filePath)
    removeSync(mainJsPath)
})

test('lazyLoadingRoutesTransformation', async () => {
    const filePath: string = path.resolve('tests/out-ast-parse/routes.js')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const transformationParams: TransformationParams = {
        config: {}
    }
    const result: TransformationResult = await lazyLoadingRoutesTransform(fileInfo, transformationParams, null)
    expect(result.content).toMatch('() => import("../components/test.vue")')
})

test('chainWebpackTransformation', async () => {
    const filePath: string = path.resolve('tests/out-ast-parse/vue.config.js')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const transformationParams: TransformationParams = {
        config: {
            rootDir:  path.resolve('tests/out-ast-parse')
        }
    }
    const result: TransformationResult = await chainWebpackTransformation(fileInfo, transformationParams, parsingResult)
    expect(fs.existsSync(path.resolve('tests/out-ast-parse/vue.temp.config.js'))).toBe(true)
    expect(result.content).toMatch('htmlPluginOptions:')
})

test('findJsxInScriptParser',  () => {
    const filePath: string = path.resolve('tests/out-ast-parse/jsxInScript.vue')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const result = findJsxInScriptParser(fileInfo) as ParsingResultOccurrence[]
    expect(result.length).toBeGreaterThan(0)
})

test('findRequireContext',  () => {
    const filePath: string = path.resolve('tests/out-ast-parse/requireContext.js')
    const source: string = readSync(filePath).replace(/\r\n/g, '\n')
    const fileInfo: FileInfo = {
        path: filePath,
        source: source
    }
    const result = findRequireContext(fileInfo) as ParsingResultOccurrence[]
    expect(result.length).toBeGreaterThan(0)
})

test('astParse', async () => {
    const srcPath = path.resolve('tests/testdata/ast-parse')
    const destPath = path.resolve('tests/out-ast-parse')
    copyDirSync(srcPath, destPath)

    const config: Config = {
        rootDir: destPath
    }
    const result: AstParsingResult = await astParseRoot(destPath, config)
    Object.keys(result.parsingResult).forEach(key =>
      expect(result.parsingResult[key].length).toBeGreaterThan(0)
    )
    Object.keys(result.transformationResult).forEach(key =>
      expect(result.transformationResult[key].length).toBeGreaterThan(0)
    )
})
