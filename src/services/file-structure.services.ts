import { dayjs } from "@/config/dayjs"
import { FsRepository } from "@/repositories/fs-repository";
import { env } from "@/config/env"

type LogsUnitsType = {
  units: string
  logs: string[]
}

class FileStructure {
  private dateStart: string = ""
  private dateEnd: string = ""
  private logsUnits: LogsUnitsType[] = []
  private fsRepository: FsRepository

  constructor () {
    this.fsRepository = new FsRepository()
  }

  /**
   * Monta a estrutura de logs para cada unidade encontrada,
   * chamando checksFolders e armazenando o resultado em logsUnits.
   *
   * @param {string[]} units - Lista de unidades
   * @returns {void}
   */

  private mapUnitsToLogs (units: string[]) {
    for(const unitPath of units) {
      const resultUnits = this.checksFolders(unitPath)
      if(resultUnits !== null) {
        this.logsUnits.push({ units: unitPath, logs: resultUnits })
      }
    }
  }

  /**
   * Lê os arquivos de log de uma unidade através do FsRepository
   * e aplica filtro de datas.
   *
   * @param {string} path - Nome da unidade
   * @returns {string[]} Lista de arquivos de log filtrados por data
   * @throws {AppError} Se não for possível ler os logs da unidade
   */

  private checksFolders (path: string) {
    try {
      const result = this.fsRepository.showFilesFolder(`${env.PATCHFILE}/${path}/Logs`)
      const onlyTextFiles = result.filter(value => value.includes(".txt"))
      
      return this.dateLogs(onlyTextFiles)
    } catch {
      return null
    }
  }

   /**
   * Filtra um array de strings de log, retornando apenas as que contêm
   * datas no intervalo definido em this.dateStart e this.dateEnd (inclusive).
   *
   * @param {string[]} logsDate - Array de strings no formato 'log YYYY-MM-DD.txt'
   * @returns {string[]} Array contendo apenas os logs cujas datas estão no intervalo especificado
   */

  private dateLogs (logsDate: string[]): string[] {
    const inicio = dayjs(this.dateStart)
    const fim = dayjs(this.dateEnd)

    const chosenDate = logsDate.filter(date => {
      const refatureStringDate = dayjs(date.split(" ")[1].split(".")[0])
      return refatureStringDate.isBetween(inicio, fim, "day", "[]")
    })
        
    return chosenDate
  }

  /**
 * Retorna a estrutura de arquivos de log filtrada por intervalo de datas.
 *
 * @param {Object} params - Objeto contendo datas inicial e final
 * @param {string} params.bodyDateStart - Data inicial no formato YYYY-MM-DD
 * @param {string} params.bodyDateEnd - Data final no formato YYYY-MM-DD
 * @returns {LogsUnitsType[]} Estrutura com unidades e seus respectivos logs
 */

  public getFilesTree({ bodyDateStart, bodyDateEnd }: { bodyDateStart: string, bodyDateEnd: string }) {
    this.dateStart = bodyDateStart
    this.dateEnd = bodyDateEnd

    const units = this.fsRepository.showFilesFolder(env.PATCHFILE)
    const removingHiddenFolders = units.filter(value => !value.includes("."))
    this.mapUnitsToLogs(removingHiddenFolders)
    return this.logsUnits
  }
}

  export { FileStructure }