import path from "path";
import {TemplateData} from "../src/config/config";
import {render} from "../src/generate/render";
import {readSync} from "../src/utils/file";
import { sortByNum } from "../src/utils/report"
import fs from "fs";

test('render vite.config.js from template',  () => {
  const outDir: string = path.resolve('tests/out-render')
  const templatePath: string = path.resolve('src/template/vite.config.ejs')
  const data: TemplateData = {
    IMPORT_LIST: [
        'import { viteCommonjs } from \'@originjs/vite-plugin-commonjs\''
    ],
    USER_CONFIG: '{\n' +
        '    plugins: [\n' +
        '      viteCommonjs()\n' +
        '    ]\n' +
        '  }'
  }
  render(outDir, templatePath, data)
  const source = readSync(path.resolve(outDir, 'vite.config.js'))
  expect(source).toMatch('import { viteCommonjs } from \'@originjs/vite-plugin-commonjs\'')
  expect(source).toMatch('viteCommonjs()')
  fs.rmdirSync(outDir, { recursive: true })
});

test('sort report by item.num', () => {
  interface ConverObj {
    num: string;// 'Number'
    feat: string;// 'Conversion item'
    times?: number;// 'Conversion times'
  }
  // test 1, normal
  let reportList: ConverObj[] = []
  const nums1 =  ["V06","B01","B04","V01"];
  const result1 = ["B01","B04","V01","V06"];
  reportList = nums1.map(num => ({
    num,
    feat: ''
  }))
  sortByNum(reportList)
  expect(reportList.map(report => report.num)).toEqual(result1)

  // test 2 empty
  let reportList2: ConverObj[] = []
  const nums2 =  [];
  const result2 = [];
  reportList2 = nums2.map(num => ({
    num,
    feat: ''
  }))
  sortByNum(reportList2)
  expect(reportList2.map(report => report.num)).toEqual(result2)
})