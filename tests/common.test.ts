import { existsSync, mkdirSync, rmdirSync } from "fs";
import {getStringLinePosition, stringFormat, stringSplice} from "../src/utils/common";
import {isObject} from "../src/utils/common";
import { copyDirSync } from "../src/utils/file";

test('isObject', () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(false)
    expect(isObject('')).toBe(false)
    expect(isObject(1)).toBe(false)
    expect(isObject(true)).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
})

test('stringFormat', () => {
    const testStr ='{0} | {1} | {2}'
    const result = stringFormat(testStr, 'replace content 1', 'replace content 2')
    expect(result).toBe('replace content 1 | replace content 2 | {2}')
})

test('stringSplice', () => {
    const testStr ='0123456789'
    const result = stringSplice(testStr, 5, 6)
    expect(result).toBe('012346789')
})

test('getStringLinePosition', () => {
    const testStr = ' line1\n line2\n line3\n line4\n'
    const result = getStringLinePosition(testStr, 2)
    expect(result).toBe(13)
})

test('copyDirSync', () => {
    const sourcePath: string = 'tests/out-for-copy'
    const destPath_1: string = 'tests/out-for-copy-result1'
    const destPath_2: string = 'tests/out-for-copy-result2'
    mkdirSync(sourcePath, { recursive: true })
    mkdirSync(`${sourcePath}/exclude`, { recursive: true })
    copyDirSync(sourcePath, destPath_1)
    expect(existsSync(destPath_1)).toBe(true)
    expect(existsSync(`${destPath_1}/exclude`)).toBe(true)
    copyDirSync(sourcePath, destPath_2, ['exclude'])
    expect(existsSync(destPath_2)).toBe(true)
    expect(existsSync(`${destPath_2}/exclude`)).toBe(false)
    rmdirSync(sourcePath, { recursive: true })
    rmdirSync(destPath_1, { recursive: true })
    rmdirSync(destPath_2, { recursive: true })
})
