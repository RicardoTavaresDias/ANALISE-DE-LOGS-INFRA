import { FsGlpiRepository } from "@/repositories/fs-glpi-repository"
import standardizationUnits from "@/lib/standardization-units"

const fsGlpiRepository = new FsGlpiRepository()

export function taskCalled (unit: string = 'apura') {
  const resultTmp = fsGlpiRepository.showFolderTmp('./tmp')
  
  return resultTmp
}

export function readTaskCalled (units: string[], unit: string) {
  const resultUnits = units.map(value => fsGlpiRepository.showFolderTmp(`./tmp/${value}`))
  
  return [...resultUnits.filter(value => value[0].includes(unit))]
}