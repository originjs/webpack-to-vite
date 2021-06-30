export function isObject (value : any) : boolean {
  return Object.prototype.toString.call(value) === '[object Object]';
}
