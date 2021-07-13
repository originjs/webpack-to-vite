import fs from 'fs'
import path from 'path'
import { readSync, writeSync } from '../utils/file'

export function genePatches (patchesDir: string): void {
  // read all patches name
  const patchesInfo = fs.readdirSync('patches');
  // inject patch
  patchesInfo.forEach(patch => {
    const filePath = path.resolve(patchesDir, patch);
    const patchContent = readSync(path.resolve('patches', patch));
    writeSync(filePath, patchContent);
  });
}
