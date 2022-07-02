import * as fs from 'fs'
import path from 'path'
import { table } from 'table'
import chalk from 'chalk'
import { cliInstance } from '../cli/cli'
import { pathFormat } from './file'

interface ConverObj {
  num: string;// 'Number'
  feat: string;// 'Conversion item'
  times?: number;// 'Conversion times'
}

const reportList: ConverObj[] = []
const tabDt = [
  ['Number', 'Conversion item', 'Conversion count']
];

function recordConver (args: ConverObj) {
  const { num, feat } = args
  cliInstance.increment({ doSomething: `Transforming: ${feat}` })
  for (let i = 0; i < reportList.length; i++) {
    if (reportList[i]?.num === num) {
      reportList[i].times++
      return
    }
  }
  reportList.push({
    num, feat, times: 1
  })
}

function sortByNum (reportList: ConverObj[] = []) {
  reportList.sort((current, next) => {
    // same char, then sort by after-number
    if (current.num[0] === next.num[0]) {
      return Number(current.num.substring(1)) - Number(next.num.substring(1))
    }
    // sort by first char
    return current.num.charCodeAt(0) - next.num.charCodeAt(0)
  })
}

function printReport (dir: string, beginTime: number) {
  cliInstance.update(cliInstance.total, { doSomething: 'All done!' });
  cliInstance.stop()
  console.log('conversion items successful converted:')

  sortByNum(reportList)

  reportList.forEach(item => {
    tabDt.push([item.num, item.feat, item.times?.toString()])
  })
  const tableStr: string = table(tabDt, {
    drawHorizontalLine: (lineIndex, rowCount) => {
      return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount
    },
    columns: [{ alignment: 'center' }, { alignment: 'left' }, { alignment: 'center' }]
  })
  console.log(tableStr);
  console.log(chalk.green(`Conversion finished in ${Date.now() - beginTime}ms.`))
  const options = {
    flags: 'w', //
    encoding: 'utf8' // utf8编码
  }
  const dirPaths: string[] = pathFormat(dir).split('/')
  const conversionLogPath: string = path.join(...dirPaths, 'conversion.log')
  const stdout = fs.createWriteStream(conversionLogPath, options);
  const logger = new console.Console(stdout);
  logger.log('--------------------------------------------------')
  logger.log('conversion items successful conversion: \n')
  logger.log(tableStr)
  console.log(chalk.green(`The report output path is ${conversionLogPath}`));
}
export { recordConver, printReport, sortByNum }
