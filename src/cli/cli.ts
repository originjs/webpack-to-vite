import path from 'path'
import fs from 'fs'
import { genIndexHtml } from '../generate/geneIndexHtml'
import { genePackageJson as genPackageJson } from '../generate/genePackageJson'
import { geneViteConfig } from '../generate/geneViteConfig'
import { Command } from 'commander'
import { Config } from '../config/config'

export function run (): void {
  const program = new Command()
  const version = require('../../package.json').version
  program
    .version(version, '-v, --version', 'output the version number')
    .option('-d --rootDir <path>', 'the directory of project to be transfered')
    .option('-t --projectType <type>', 'the type of the project, use vue-cli or webpack')
    .parse(process.argv)

  const keys = ['rootDir', 'projectType']
  const config: Config = {}
  keys.forEach(function (k) {
    if (Object.prototype.hasOwnProperty.call(program.opts(), k)) {
      config[k] = program.opts()[k]
    }
  })
  start(config)
}

export function start (config : Config): void {
  console.log('******************* Webpack to Vite *******************')
  console.log(`Project path: ${config.rootDir}`)

  if (!fs.existsSync(config.rootDir)) {
    console.error(`Project path is not correct : ${config.rootDir}`)
    return
  }

  const cwd = process.cwd()
  const rootDir = path.resolve(config.rootDir)

  // TODO:how to deal with the index.html in the project,
  // notice that this will not choose the root directory in non-vite projects
  genIndexHtml(rootDir)

  genPackageJson(path.resolve(rootDir, 'package.json'))

  geneViteConfig(rootDir, rootDir, config.projectType)

  console.log('************************ Done ! ************************')
  const pkgManager = fs.existsSync(path.resolve(rootDir, 'yarn.lock'))
    ? 'yarn'
    : 'npm'

  console.log('Now please run:\n')
  if (rootDir !== cwd) {
    console.log(`cd ${path.relative(cwd, rootDir)}`)
  }

  console.log(`${pkgManager === 'yarn' ? 'yarn' : 'npm install'}`)
  console.log(
    `${pkgManager === 'yarn' ? 'yarn serve-vite' : 'npm run serve-vite'}`
  )
  console.log()
}
