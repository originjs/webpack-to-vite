import path from "path";
import {genePackageJson, getGreaterVersion, processDependencies} from "../src/generate/genePackageJson";
import fs from "fs";
import {removeSync, readSync} from "../src/utils/file";

describe('genePackageJson', () => {
    beforeAll(() => {
        fs.mkdirSync(path.resolve('tests/out-package-json'), { recursive: true })
    })
    afterAll(() => {
        fs.rmdirSync(path.resolve('tests/out-package-json'), { recursive: true })
    })
    afterEach(() => {
        removeSync(path.resolve('tests/out-package-json/package.json'))
    })

    test('generate normal package.json', () => {
        const testPackageJsonPath = path.resolve('tests/testdata/package-json/package-normal.json')
        const packageJsonPath = path.resolve('tests/out-package-json/package.json')
        fs.copyFileSync(testPackageJsonPath, packageJsonPath)
        const testPostcssConfigPath = path.resolve('tests/testdata/package-json/postcss.config.js')
        const postcssConfigPath = path.resolve('tests/out-package-json/postcss.config.js')
        fs.copyFileSync(testPostcssConfigPath, postcssConfigPath)
        genePackageJson(packageJsonPath);
        const packageJsonContent = JSON.parse(readSync(packageJsonPath))
        expect(packageJsonContent.devDependencies).toMatchObject(expect.objectContaining({
            'vite-plugin-env-compatible': expect.any(String),
            'vite-plugin-html': expect.any(String),
            'vite': expect.any(String),
            'sass': expect.any(String),
            'postcss': expect.any(String),
        }))
        expect(packageJsonContent.scripts).toMatchObject(expect.objectContaining({
            'serve-vite': 'vite',
            'build-vite': 'vite build',
        }))
    });

    test('generate vue2 package.json', () => {
        const testPackageJsonPath = path.resolve('tests/testdata/package-json/package-vue2.json')
        const packageJsonPath = path.resolve('tests/out-package-json/package.json')
        fs.copyFileSync(testPackageJsonPath, packageJsonPath)
        genePackageJson(packageJsonPath);
        const packageJsonContent = JSON.parse(readSync(packageJsonPath))
        expect(packageJsonContent.devDependencies).toMatchObject(expect.objectContaining({
            'vite-plugin-vue2': expect.any(String),
        }))
    });

    test('generate vue3 package.json', () => {
        const testPackageJsonPath = path.resolve('tests/testdata/package-json/package-vue3.json')
        const packageJsonPath = path.resolve('tests/out-package-json/package.json')
        fs.copyFileSync(testPackageJsonPath, packageJsonPath)
        genePackageJson(packageJsonPath);
        const packageJsonContent = JSON.parse(readSync(packageJsonPath))
        expect(packageJsonContent.devDependencies).toMatchObject(expect.objectContaining({
            '@vue/compiler-sfc': expect.any(String),
            '@vitejs/plugin-vue': expect.any(String),
            '@vitejs/plugin-vue-jsx': expect.any(String),
        }))
    });
})

test('getGreaterVersion', () => {
    expect(getGreaterVersion('0.0.1', '0.0.0')).toEqual('0.0.1')
    expect(getGreaterVersion('0.0.1', '^0.0.0')).toEqual('0.0.1')
    expect(getGreaterVersion('^0.0.1', '^0.0.0')).toEqual('^0.0.1')
    expect(getGreaterVersion('<0.0.1', '>0.0.1')).toEqual('>0.0.1')
})

test('processDependencies', () => {
    type PackageJson = {
        dependencies?: object,
        devDependencies?: object
    }

    const originPackageJsonA: PackageJson = {
        dependencies: {
            sass: '^1.1.1'
        }
    }
    const packageJsonA: PackageJson = {
        dependencies: {
            sass: '^1.1.1'
        },
        devDependencies: {
            sass: '0.1.1'
        }
    }
    const resultA = processDependencies(originPackageJsonA.dependencies, packageJsonA.dependencies, packageJsonA.devDependencies)
    expect(resultA).toEqual({
        targetDependencies: {
            sass: '^1.1.1'
        },
        restDependencies: {}
    })

    const originPackageJsonB: PackageJson = {
        dependencies: {
            sass: '^1.1.1'
        }
    }
    const packageJsonB: PackageJson = {
        dependencies: {
            sass: '0.1.1'
        }
    }
    const resultB = processDependencies(originPackageJsonB.dependencies, packageJsonB.dependencies, packageJsonB.devDependencies)
    expect(resultB).toEqual({
        targetDependencies: {
            sass: '^1.1.1'
        }
    })
})
