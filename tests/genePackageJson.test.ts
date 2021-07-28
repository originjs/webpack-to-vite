import path from "path";
import {genePackageJson, getGreaterVersion, processDependencies} from "../src/generate/genePackageJson";
import fs from "fs";
import {copyDir, readSync} from "../src/utils/file";

describe('genePackageJson', () => {
    beforeAll(async () => {
        const srcPath = path.resolve('tests/testdata/package-json')
        const destPath = path.resolve('tests/out')
        copyDir(srcPath, destPath)
    })
    afterAll(() => {
        fs.rmdirSync(path.resolve('tests/out'), { recursive: true })
    })

    test('generate normal package.json', () => {
        const packageJsonPath = path.resolve('tests/out/package-normal.json')
        genePackageJson(packageJsonPath);
        const packageJsonContent = JSON.parse(readSync(packageJsonPath))
        expect(packageJsonContent.devDependencies).toMatchObject(expect.objectContaining({
            'vite-plugin-env-compatible': expect.any(String),
            'vite-plugin-html': expect.any(String),
            'vite': expect.any(String),
            'sass': expect.any(String),
            'postcss': expect.any(String),
            'patch-package': expect.any(String),
        }))
        expect(packageJsonContent.scripts).toMatchObject(expect.objectContaining({
            'serve-vite': 'vite',
            'build-vite': 'vite build',
            'postinstall': 'patch-package',
        }))
    });

    test('generate vue2 package.json', () => {
        const packageJsonPath = path.resolve('tests/out/package-vue2.json')
        genePackageJson(packageJsonPath);
        const packageJsonContent = JSON.parse(readSync(packageJsonPath))
        expect(packageJsonContent.devDependencies).toMatchObject(expect.objectContaining({
            'vite-plugin-vue2': expect.any(String),
        }))
    });

    test('generate vue3 package.json', () => {
        const packageJsonPath = path.resolve('tests/out/package-vue3.json')
        genePackageJson(packageJsonPath);
        const packageJsonContent = JSON.parse(readSync(packageJsonPath))
        expect(packageJsonContent.devDependencies).toMatchObject(expect.objectContaining({
            '@vue/compiler-sfc': expect.any(String),
            '@vitejs/plugin-vue': expect.any(String),
            '@vitejs/plugin-vue-jsx': expect.any(String),
        }))
    });
})

test('test', () => {
    const a = {
        b: 1
    }
    const b = {
        b: 1,
        c: 2
    }
    expect(b).toMatchObject(expect.objectContaining(a))
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
