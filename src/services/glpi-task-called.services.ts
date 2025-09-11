import { FsGlpiRepository,  } from "@/repositories/fs-glpi-repository"

const fsGlpiRepository = new FsGlpiRepository()

export function taskCalled () {
  const resultTmp = fsGlpiRepository.showFolderTmp('./tmp')
  
  return resultTmp
}

export async function readTaskCalled (units: string) {
  const result = await fsGlpiRepository.read(units)

  if(!result.contentSucess && result.contentError) {
    return { logs: result.contentError, isError: false }
  }

  if(!result.contentError && result.contentSucess) {
    return { logs: result.contentSucess, isError: true }
  }

  const text = result.contentSucess as string + result.contentError as string

  return { logs: text, isError: false }
}

export function removeFolderUnit (unit: string) {
  return fsGlpiRepository.removeFolder(unit)
}