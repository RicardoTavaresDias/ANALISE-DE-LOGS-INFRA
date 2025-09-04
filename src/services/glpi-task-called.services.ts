import { FsGlpiRepository } from "@/repositories/fs-glpi-repository"

const fsGlpiRepository = new FsGlpiRepository()

export function taskCalled () {
  const resultTmp = fsGlpiRepository.showFolderTmp('./tmp')
  
  return resultTmp
}

export function readTaskCalled (units: string[], unit: string) {
  const resultUnits = units.map(value => fsGlpiRepository.showFolderTmp(`./tmp/${value}`))
  
  return [...resultUnits.filter(value => value[0].includes(unit))]
}