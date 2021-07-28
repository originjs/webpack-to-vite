import {copyDir, readSync} from '../src/utils/file';
import path from "path";
import {FileInfo, TransformationParams} from "../src/ast-parse/astParse";
import fs from "fs";
import {astTransform as addJsxTransform} from "../src/ast-parse/transformations/addJsxTransformation";
import {astTransform as removeHtmlLangTransform} from "../src/ast-parse/transformations/removeHtmlLangInTemplateTransformation";

beforeAll(async () => {
    const srcPath = path.resolve('tests/testdata/ast-parse')
    const destPath = path.resolve('tests/out')
    copyDir(srcPath, destPath)
})
afterAll(() => {
    fs.rmdirSync(path.resolve('tests/out'), { recursive: true })
})

test('addJsxTransformation', async () => {
    const filePath: string = path.resolve('tests/out/addJsx.vue')
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
    const result = await addJsxTransform(fileInfo, config)
    expect(result.content).toContain('lang="tsx"')
})

test('removeHtmlLangInTemplateTransformation', async () => {
    const filePath: string = path.resolve('tests/out/removeHtmlLang.vue')
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
    const result = await removeHtmlLangTransform(fileInfo, config)
    expect(result.content).not.toContain('lang="html"')
})
