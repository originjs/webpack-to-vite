import path from 'path'
import fs from 'fs'
import { geneIndexHtml } from '../generate/geneIndexHtml'
import { genePackageJson } from '../generate/genePackageJson'
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
    .option('-e --entry <type>', 'entrance of the entire build process, webpack or vite will start from ' +
            'those entry files to build, if no entry file is specified, src/main.ts or src/main.js will be' +
            'used as default')
    .parse(process.argv)

  const keys = ['rootDir', 'projectType', 'entry']
  const config: Config = {}
  keys.forEach(function (k) {
    if (Object.prototype.hasOwnProperty.call(program.opts(), k)) {
      config[k] = program.opts()[k]
    }
  })
  start(config)
}

export async function start (config : Config): Promise<void> {
  console.log('******************* Webpack to Vite *******************')
  console.log(`Project path: ${config.rootDir}`)

  if (!fs.existsSync(config.rootDir)) {
    console.error(`Project path is not correct : ${config.rootDir}`)
    return
  }

  const cwd = process.cwd()
  const rootDir = path.resolve(config.rootDir)

  genePackageJson(path.resolve(rootDir, 'package.json'))

  await geneViteConfig(rootDir, rootDir, config)

  // generate index.html must be after generate vite.config.js
  geneIndexHtml(rootDir, config)

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
