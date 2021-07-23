import * as fs from 'fs'
import { table } from 'table'
import chalk from 'chalk'
import { cliInstance } from '../cli/cli'

interface ConverObj {
  num: string;// 'Number'
  feat: string;// 'Features'
  times?: number;// 'Conversion times'
}

const reportList: ConverObj[] = []
const tabDt = [
  ['Number', 'Features', 'Conversion count']
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

function printReport (dir: string, beginTime: number) {
  cliInstance.update(cliInstance.total, { doSomething: 'All done!' });
  cliInstance.stop()
  console.log('features of successful conversion:')
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
  while (dir[dir.length - 1] === '/') {
    dir = dir.slice(0, dir.length - 1)
  }
  dir += '/'
  const stdout = fs.createWriteStream(`${dir}conversion.log`, options);
  const logger = new console.Console(stdout);
  logger.log('--------------------------------------------------')
  logger.log('features of successful conversion: \n')
  logger.log(tableStr)
  console.log(chalk.green(`The report output path is ${dir}conversion.log`));
}
export { recordConver, printReport }
