import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import { geneIndexHtml } from '../generate/geneIndexHtml'
import { genePackageJson } from '../generate/genePackageJson'
import { geneViteConfig } from '../generate/geneViteConfig'
import { genePatches } from '../generate/genePatches'
import { Command } from 'commander'
import { Config } from '../config/config'
import { astParseRoot, AstParsingResult } from '../ast-parse/astParse'
import { printReport, recordConver } from '../utils/report'

const beginTime = Date.now()

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
    .option('-r --reportType <type>', "'log' will output a file of log")
    .parse(process.argv)

  const keys = ['rootDir', 'projectType', 'entry', 'reportType']
  const config: Config = {}
  keys.forEach(function (k) {
    if (Object.prototype.hasOwnProperty.call(program.opts(), k)) {
      config[k] = program.opts()[k]
    }
  })
  start(config)
}

export async function start (config : Config): Promise<void> {
  console.log(chalk.green('******************* Webpack to Vite *******************'))
  console.log(chalk.green(`Project path: ${config.rootDir}`))

  if (!fs.existsSync(config.rootDir)) {
    console.log(chalk.red(`Project path is not correct : ${config.rootDir}`))
    return
  }
  const cwd = process.cwd()
  const rootDir = path.resolve(config.rootDir)

  const astParsingResult: AstParsingResult = await astParseRoot(rootDir, config)
  genePackageJson(path.resolve(rootDir, 'package.json'))

  await geneViteConfig(rootDir, rootDir, config)

  // generate index.html must be after generate vite.config.js
  await geneIndexHtml(rootDir, config, astParsingResult)
  printReport(config.reportType, config.rootDir, beginTime) // output conversion

  // generate patches
  const patchesDir = path.resolve(rootDir, 'patches')
  genePatches(patchesDir)
  recordConver({ num: 'B05', feat: 'required plugins' })
  console.log(chalk.green('************************ Done ! ************************'))
  const pkgManager = fs.existsSync(path.resolve(rootDir, 'yarn.lock'))
    ? 'yarn'
    : 'npm'

  console.log(chalk.green('Now please run:\n'))
  if (rootDir !== cwd) {
    console.log(chalk.green(`cd ${path.relative(cwd, rootDir)}`))
  }

  console.log(chalk.green(`${pkgManager === 'yarn' ? 'yarn' : 'npm install'}`))
  console.log(chalk.green(
    `${pkgManager === 'yarn' ? 'yarn serve-vite' : 'npm run serve-vite'}`
  ))
  console.log()
}
