import * as fs from 'fs'

export function saveObjectToJson(object: any, path: string) {
  try {
    fs.writeFileSync(path, JSON.stringify(object))
  } catch (e) {
    console.error('Can not save results to file: ${path}', e)
  }
}

export function readObjectFromJson(path: string) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  } catch (e) {
    console.error('Can not parse json file: ${path}', e)
  }
}
