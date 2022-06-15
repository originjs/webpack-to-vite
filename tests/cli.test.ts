import { spawnSync } from 'child_process'
import { rmdirSync, existsSync, mkdirSync } from 'fs'
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

beforeAll(() => {
  mkdirSync(path.resolve('tests/out-cli-webpack'), { recursive: true })
})
afterAll(() => {
  rmdirSync(path.resolve('tests/out-cli-webpack'), { recursive: true })
})

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
  const { status } = runSync(['-d', path.resolve('tests/out-cli-webpack')])
  expect(existsSync(path.resolve('tests/out-cli-webpack-toVite'))).toEqual(true)
  expect(status).toEqual(0)
  rmdirSync(path.resolve('tests/out-cli-webpack-toVite'), { recursive: true })
})

test('webpack-to-vite -c, --cover', () => {
  const { status } = runSync([
    '-d',
    path.resolve('tests/out-cli-webpack'),
    '-c'
  ])
  expect(existsSync(path.resolve('tests/out-cli-webpack-toVite'))).toEqual(
    false
  )
  expect(status).toEqual(0)
})
