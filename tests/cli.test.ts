import { spawnSync } from 'child_process'
import { rmdirSync, existsSync, mkdirSync } from 'fs-extra'
import type {
  SpawnSyncReturns,
  SpawnSyncOptionsWithStringEncoding
} from 'child_process'
import path from 'path'

const version: string = require('../package.json').version
const cliPath: string = path.resolve(__dirname, '../dist/bin/index')
const spawnOption: SpawnSyncOptionsWithStringEncoding = {
  encoding: 'utf-8',
  shell: process.platform === 'win32'
}

function runSync(
  args: readonly string[],
  options: SpawnSyncOptionsWithStringEncoding = spawnOption
): SpawnSyncReturns<string> {
  options = { ...options, ...spawnOption }
  const commands = ['node', cliPath, ...args]
  const result = spawnSync('npx', commands, options)
  return result
}

test('webpack-to-vite -v, --version', () => {
  const { stdout, status } = runSync(['--version'])
  expect(stdout).toContain(version)
  expect(status).toEqual(0)
})

test('webpack-to-vite -h, --help', () => {
  const { stdout, status } = runSync(['--help'])
  expect(stdout).toMatchSnapshot('A1')
  expect(status).toEqual(0)
})

test('webpack-to-vite -d, --rootDir <path>', () => {
  mkdirSync('tests/out-rootDir-webpack', { recursive: true })
  const { status } = runSync(['-d', 'tests/out-rootDir-webpack'])
  expect(existsSync('tests/out-rootDir-webpack-toVite')).toEqual(true)
  expect(status).toEqual(0)
  rmdirSync('tests/out-rootDir-webpack', { recursive: true })
  rmdirSync('tests/out-rootDir-webpack-toVite', { recursive: true })
})

test('webpack-to-vite -c, --cover', () => {
  mkdirSync('tests/out-cover-webpack', { recursive: true })
  const { status } = runSync([
    '-d',
    path.resolve('tests/out-cover-webpack'),
    '-c'
  ])
  expect(existsSync('tests/out-cover-webpack-toVite')).toEqual(
    false
  )
  expect(status).toEqual(0)
  rmdirSync('tests/out-cover-webpack', { recursive: true })
})
