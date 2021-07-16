import * as fs from 'fs'
import { table } from 'table'
import chalk from 'chalk'

interface ConverObj {
  num: string;// 'Number'
  feat: string;// 'Features'
  times?: number;// 'Conversion times'
}

const reportList: ConverObj[] = []
const tabDt = [
  ['Number', 'Features', 'Conversion count']
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

function printReport (reportType: string, dir:string) {
  console.log('features of successful conversion:')
  reportList.forEach(item => {
    tabDt.push([item.num, item.feat, item.times?.toString()])
  })
  console.log(table(tabDt, tabFormat));
  if (reportType === 'log') {
    const options = {
      flags: 'w', //
      encoding: 'utf8' // utf8编码
    }
    console.log(chalk.yellow(`output ${dir}conversion.log`));
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
  } else {
    console.log(chalk.yellow('If you want to output the report file, add "-r log" after the command'));
  }
}
export { recordConver, printReport }
