import { AppError } from "@/utils/AppError";
import fs from "node:fs"
import { dayjs } from "@/config/dayjs"

type LogsUnitsType = {
  units: string
  logs: string[]
}

class FileStructure {
  private dateStart: string = ""
  private dateEnd: string = ""
  private logsUnits: LogsUnitsType[] = []

  /**
   * Lê a pasta ./unidade e retorna as unidades encontradas.
   * @throws {AppError} Se a pasta estiver vazia ou não puder ser lida.
   * @returns {string[]} Lista de unidades
   */

  private readUnits(): string[] {
    try {
      const result = fs.readdirSync("./unidade")
      if(result.length === 0) throw new AppError("Não há Arquivos.", 404)

      return result
    } catch {
      throw new AppError("Não foi possível ler a pasta ./unidade", 500)
    }
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
      this.logsUnits.push({ units: unitPath, logs: resultUnits })
    }
  }

  /**
   * Lê a subpasta Logs de uma unidade.
   * @param {string} path - Nome da unidade
   * @throws {AppError} Se a pasta Logs estiver vazia ou não puder ser lida.
   * @returns {string[]} Lista de arquivos da pasta Logs
   */

    checksFolders (path: string): string[] {
      try {
        const result =  fs.readdirSync(`./unidade/${path}/Logs`)
        if(result.length === 0) throw new AppError("Não há Arquivos.", 404)

      
        return this.dateLogs(result)
      } catch {
        throw new AppError(`Não foi possível ler a pasta Logs de ${path}`, 500)
      }
    }

    /**
   * Filtra um array de strings de log, retornando apenas as que contêm
   * datas no intervalo de 2025-08-05 a 2025-08-07 (inclusive).
   *
   * @param logsDate - Array de strings no formato 'log YYYY-MM-DD.txt'
   * @returns Array contendo apenas os logs cujas datas estão no intervalo especificado
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

    getFilesTree({ bodyDateStart, bodyDateEnd }: { bodyDateStart: string, bodyDateEnd: string }) {
      this.dateStart = bodyDateStart
      this.dateEnd = bodyDateEnd

      const units = this.readUnits()
      // ----------------- fazer com ws WebSocket ---------------------------
      this.mapUnitsToLogs(units)
      return this.logsUnits
    }
}

  export { FileStructure }