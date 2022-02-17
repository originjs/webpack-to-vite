export function isObject (value : any) : boolean {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function stringFormat (formatString: string, ...args: string[]) {
  return formatString.replace(/{(\d)+}/g, function (match, number) {
    return typeof args[number] !== 'undefined' ? args[number] : match
  })
}

export function stringSplice (source: string, start: number, end: number) {
  return source.substring(0, start) + source.substring(end)
}

export function getStringLinePosition (source: string, line: number = 0) {
  let i = 0
  let pos = 0
  while (i < line) {
    pos = source.indexOf('\n', pos + 1)
    i++
  }
  return pos
}
