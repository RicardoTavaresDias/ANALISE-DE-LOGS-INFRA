import { FsGlpiRepository,  } from "@/repositories/fs-glpi-repository"

const fsGlpiRepository = new FsGlpiRepository()

export function taskCalled () {
  const resultTmp = fsGlpiRepository.showFolderTmp('./tmp')
  
  return resultTmp
}

export async function readTaskCalled (units: string) {
  const result = await fsGlpiRepository.read(units)

  const text = result.contentError.length === 0 ? 
    result.contentSucess : 
    result.contentSucess + result.contentError

  return { logs: text, isError: result.contentError.length === 0 }
}

export function removeFolderUnit (unit: string) {
  return fsGlpiRepository.removeFolder(unit)
}