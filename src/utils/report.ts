// import * as fs from 'fs'

const reportOpt = { noRepot: false, formatterType: 'console' }
// formatterType => default value is 'console',may be 'log' will output a file of log
// const reportInfo = { totalDetected: 0, totalChanged: 0 }
const reportList = {}

function recordConver (key: string) {
  if (reportOpt.noRepot) return
  if (Object.prototype.hasOwnProperty.call(reportList, key)) {
    reportList[key]++
  } else {
    reportList[key] = 1
  }
}

function printReport () {
  if (reportOpt.noRepot) return
  const printArr: any[] = Object.keys(reportList)
  console.log('features of successful conversion:')
  printArr.forEach(key => {
    // console.log(`${key} : ${reportList[key]}`)
    console.log(key)
  })
  // TODO
  // if (reportOpt.formatterType === 'log') {
  //   const options = {
  //     flags: 'w', //
  //     encoding: 'utf8' // utf8编码
  //   }
  //   const stdout = fs.createWriteStream('./vue_codemod.log', options);
  //   const logger = new console.Console(stdout);
  //   logger.log(`--------------------------------------------------`)
  //   logger.log(`Processed file:\n${processFilePathList}\n`)
  // }
}
export { reportOpt, recordConver, printReport }
