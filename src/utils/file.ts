import fs from 'fs'
import path from 'path'

export function writeSync (filePath: string, data: string):void {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, data)
  } catch (e) {
    console.error(`write file fail, filePath:${filePath}, error: ${e}`)
  }
}

export function readSync (filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return content.toString()
  } catch (e) {
    console.error(`read file fail, filePath:${filePath}, error: ${e}`)
  }

  return ''
}

export function removeSync (filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (e) {
    console.error(`remove file fail, filePath:${filePath}, error: ${e}`)
  }
}

export function pathFormat (filePath: string): string {
  return filePath.replace(/\\/g, '/')
}

export function relativePathFormat (rootDir: string, filePath: string): string {
  return path.relative(rootDir, path.resolve(rootDir, filePath)).replace(/\\/g, '/')
}

export function copyDir (src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}
