import path from 'path'
import fs, { existsSync } from 'fs'
import chalk from 'chalk'
import { geneIndexHtml } from '../generate/geneIndexHtml'
import { genePackageJson } from '../generate/genePackageJson'
import { geneViteConfig } from '../generate/geneViteConfig'
import { Command } from 'commander'
import type { Config } from '../config/config'
import type { AstParsingResult } from '../ast-parse/astParse';
import { astParseRoot } from '../ast-parse/astParse'
import { printReport } from '../utils/report'
import cliProgress from 'cli-progress'
import { removeSync } from '../utils/file'

const cliInstance = new cliProgress.SingleBar({
  format: 'progress [{bar}] {percentage}% | {doSomething} | {value}/{total}'
}, cliProgress.Presets.shades_classic)

const beginTime = Date.now()

export function run (): void {
  const program = new Command()
  const version = require('../../../package.json').version
  program
    .name('webpack-to-vite')
    .arguments('[root]')
    .version(version, '-v, --version', 'display version number')
    .option('-d --rootDir <path>', 'the directory of project to be converted')
    .option('-t --projectType <type>', 'the type of the project, use vue-cli or webpack (default: vue-cli)')
    .option('-e --entry <type>', 'entrance of the entire build process, webpack or vite will start from ' +
            'those entry files to build, if no entry file is specified, src/main.ts or src/main.js will be ' +
            'used as default')
    .action((root, options) => {
      const config: Config = {
        rootDir: options.rootDir || root,
        projectType: options.projectType,
        entry: options.entry
      }
      start(config)
    })
    .parse(process.argv)
}

export async function start (config: Config): Promise<void> {
  try {
    console.log(chalk.green('******************* Webpack to Vite *******************'))
    console.log(chalk.green(`Project path: ${config.rootDir}`))
    if (!fs.existsSync(config.rootDir)) {
      console.log(chalk.red(`Project path is not correct : ${config.rootDir}`))
      return
    }
    cliInstance.start(22, 0, { doSomething: 'Transformation begins...' }) // The current feature that can be converted is 20.
    const cwd = process.cwd()
    const rootDir = path.resolve(config.rootDir)

    const astParsingResult: AstParsingResult = await astParseRoot(rootDir, config)
    genePackageJson(path.resolve(rootDir, 'package.json'), astParsingResult)

    await geneViteConfig(rootDir, rootDir, config, astParsingResult)

    // generate index.html must be after generate vite.config.js
    await geneIndexHtml(rootDir, config, astParsingResult)
    printReport(config.rootDir, beginTime) // output conversion

    // remove temp files
    if (existsSync(path.resolve(rootDir, 'vue.temp.config.ts'))) {
      removeSync(path.resolve(rootDir, 'vue.temp.config.ts'))
    } else if (existsSync(path.resolve(rootDir, 'vue.temp.config.js'))) {
      removeSync(path.resolve(rootDir, 'vue.temp.config.js'))
    }

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
  } catch (e) {
    cliInstance.stop()
    console.log(e)
    if (e.code === 'MODULE_NOT_FOUND') {
      console.log()
      console.log('Conversion failed. Make sure you have installed the dependencies in your project.')
      console.log('Please run \'npm install\' or \'yarn\' in your project root directory and try again.')
    } else {
      console.log('Conversion failed.')
    }
    console.log()
  }
}

export { cliInstance }
