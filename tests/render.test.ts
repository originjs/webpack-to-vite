import path from 'path';
import fs from 'fs';
import { Config } from '../src/config/config'
import { geneViteConfig } from '../src/generate/geneViteConfig';
import { serializeObject } from '../src/generate/render';
import { removeSync } from "../src/utils/file";

test('geneViteConfig from non exist file', async () => {
  const outputFilePath = path.resolve('tests/out/vite.config.js');
  const vueConfigPath = path.resolve('tests/nosuchfile');
  const config : Config = {
    projectType: 'vue-cli'
  }
  await geneViteConfig(vueConfigPath, path.resolve('tests/out'), config);
  const result = fs.readFileSync(outputFilePath, 'utf8');
  removeSync(outputFilePath);
  expect(result).toContain('plugins');
});

test('geneViteConfig from vue.config.js', async () => {
  const outputFilePath = path.resolve('tests/out/vite.config.js');
  const vueConfigPath = path.resolve('tests/testdata');
  const config : Config = {
    projectType: 'vue-cli',
  }
  await geneViteConfig(vueConfigPath, path.resolve('tests/out'), config);
  const result = fs.readFileSync(outputFilePath, 'utf8');
  removeSync(outputFilePath);
  expect(result).toContain('@components');
});

test('serialize string', () => {
  const objA = {
    key1: '\r\n \\src',
    key2: '\'src\'',
    key3: '"src"',
    key4: `newline
        src`
  }
  const resultA = serializeObject(objA);
  expect(resultA).toMatch('key1: \'\r\n \\src\'');
  expect(resultA).toMatch('key2: \'\'src\'\'');
  expect(resultA).toMatch('key3: \'"src"\'');
  expect(resultA).toMatch('key4: \'newline\n');
});

test('serializeObject', () => {
  const abbreviatedKey = 'abbreviatedKey'
  const objA = {
    key1: undefined,
    key2: null,
    key3: false,
    key4: 0,
    key5: '0',
    abbreviatedKey
  }
  const resultA = serializeObject(objA);
  expect(resultA).not.toMatch('key1: undefined');
  expect(resultA).not.toMatch('key2: null');
  expect(resultA).toMatch('key3: false');
  expect(resultA).toMatch('key4: 0');
  expect(resultA).toMatch('key5: \'0\'');
  expect(resultA).toMatch('abbreviatedKey: \'abbreviatedKey\'');

  const objB = {
    key1: {
      key1: undefined,
      key2: null,
      key3: false,
      key4: 0,
      key5: '0',
      abbreviatedKey
    }
  }
  const resultB = serializeObject(objB);
  expect(resultB).toMatch('{\n' +
        '    key1: {\n' +
        '        key3: false,\n' +
        '        key4: 0,\n' +
        '        key5: \'0\',\n' +
        '        abbreviatedKey: \'abbreviatedKey\'\n' +
        '    }\n' +
        '}');

  const objC = {
    key1: [
      undefined,
      null,
      false,
      0,
      '0'
    ]
  }
  const resultC = serializeObject(objC);
  expect(resultC).toMatch('{\n' +
        '    key1: [\n' +
        '        false,\n' +
        '        0,\n' +
        '        \'0\'\n' +
        '    ]\n' +
        '}'
  );

  const objD = {
    key1: [
      objA
    ]
  }
  const resultD = serializeObject(objD);
  expect(resultD).toMatch('{\n' +
        '    key1: [\n' +
        '        {\n' +
        '            key3: false,\n' +
        '            key4: 0,\n' +
        '            key5: \'0\',\n' +
        '            abbreviatedKey: \'abbreviatedKey\'\n' +
        '        }\n' +
        '    ]\n' +
        '}'
  );

  const objE = {
    key3: function () { console.log('anonymous function') },
    key4: function () { console.log('anonymous function2') },
    key5: () => { console.log('arrow function') },
    key6: () => { console.log('arrow function') },
    key7 () { console.log('abbreviated function') },
    key8 () { console.log('abbreviated function') },
    key9 () { /* key9 */ console.log('abbreviated function') }
  }
  const resultE = serializeObject(objE);
  expect(resultE).toMatch('{\n' +
        '    key3: function () { console.log(\'anonymous function\'); },\n' +
        '    key4: function () { console.log(\'anonymous function2\'); },\n' +
        '    key5: () => { console.log(\'arrow function\'); },\n' +
        '    key6: () => { console.log(\'arrow function\'); },\n' +
        '    key7() { console.log(\'abbreviated function\'); },\n' +
        '    key8() { console.log(\'abbreviated function\'); },\n' +
        '    key9() { /* key9 */ console.log(\'abbreviated function\'); }\n' +
        '}');
});
