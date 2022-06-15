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
  return filePath.replace(/\\(\\)?/g, '/')
}

export function relativePathFormat (rootDir: string, filePath: string): string {
  return pathFormat(path.relative(rootDir, path.resolve(rootDir, filePath)))
}

export function copyDirSync (src: string, dest: string): void {
  try {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      entry.isDirectory() ? copyDirSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
    }
  } catch (e) {
    console.log()
    console.log('failed to copy files')
  }
}

export function renameSync (oldPath: string, newPath: string): void {
  try {
    fs.renameSync(oldPath, newPath)
  } catch (e) {
    console.error(`rename path fail, old path:${oldPath}, new path:${newPath}, error: ${e}`)
  }
}
