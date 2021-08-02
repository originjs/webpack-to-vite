import path from "path";
import {TemplateData} from "../src/config/config";
import {render} from "../src/generate/render";
import {readSync} from "../src/utils/file";
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
