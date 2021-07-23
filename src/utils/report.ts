import * as fs from 'fs'
import { table } from 'table'
import chalk from 'chalk'
import { cliInstance } from '../cli/cli'

interface ConverObj {
  num: string;// 'Number'
  feat: string;// 'Conversion item'
  times?: number;// 'Conversion times'
}

const reportList: ConverObj[] = []
const tabDt = [
  ['Number', 'Conversion item', 'Conversion count']
];
const tabFormat = {
  border: {
    topBody: '─',
    topJoin: '┬',
    topLeft: '┌',
    topRight: '┐',
    bottomBody: '─',
    bottomJoin: '┴',
    bottomLeft: '└',
    bottomRight: '┘',
    bodyLeft: '│',
    bodyRight: '│',
    bodyJoin: '│',
    joinBody: '─',
    joinLeft: '├',
    joinRight: '┤',
    joinJoin: '┼'
  }
};

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
  console.log('conversion items successful converted:')
  reportList.forEach(item => {
    tabDt.push([item.num, item.feat, item.times?.toString()])
  })
  console.log(table(tabDt, tabFormat));
  console.log(chalk.green(`Conversion finished in ${Date.now() - beginTime}ms.`))
  const options = {
    flags: 'w', //
    encoding: 'utf8' // utf8编码
  }
  const stdout = fs.createWriteStream(`${dir}conversion.log`, options);
  const logger = new console.Console(stdout);
  logger.log('--------------------------------------------------')
  // TODO features
  // logger.log(`Processed file:\n${processFilePathList}\n`)
  // logger.log(`Processed ${processFilePath.length} files`)
  // logger.log(`${totalDetected} places`, 'need to be transformed')
  // logger.log(`${totalChanged} places`, 'was transformed')
  // logger.log(`The transformation rate is ${transRate}%`)
  logger.log('The transformation stats: \n', tabDt)
  console.log(chalk.green(`The report output path is ${dir}conversion.log`));
}
export { recordConver, printReport }
