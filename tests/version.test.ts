import {getVueVersion} from "../src/utils/version";
import path from "path";

test('getVueVersion', () => {
    expect(getVueVersion('not-exist-dir')).toBe(undefined)
    expect(getVueVersion(path.join(__dirname, 'testdata/version/vue2'))).toBe(2)
    expect(getVueVersion(path.join(__dirname, 'testdata/version/vue3'))).toBe(3)
})
