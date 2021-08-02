import fs from 'fs'
import path from 'path'
import { readSync, writeSync } from '../utils/file'

export function genePatches (patchesDir: string): void {
  const copyFromPatchesDir: string = path.resolve(__dirname, '../../../patches')
  // read all patches name
  const patchesInfo = fs.readdirSync(copyFromPatchesDir);
  // inject patch
  patchesInfo.forEach(patch => {
    const filePath = path.resolve(patchesDir, patch);
    const patchContent = readSync(path.resolve(copyFromPatchesDir, patch));
    writeSync(filePath, patchContent);
  });
}
