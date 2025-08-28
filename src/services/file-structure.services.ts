import { AppError } from "@/utils/AppError";
import fs from "node:fs"
import { dayjs } from "@/config/dayjs"

type LogsUnitsType = {
  logsUnits: string[]
  text: string[]
  unitEnd?: boolean
}

class FileStructure {
  private dateStart: string = ""
  private dateEnd: string = ""

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
   * Monta a árvore completa das unidades e seus logs.
   * @param {string[]} units - Lista de unidades
   * @returns {string} Estrutura em formato de árvore
   */

  private structuralTree (units: string[]): string {
    let text = [`      ├── unidade`]

    // Adiciona pastas dentro da unidade
    for(const unitPath of units) {
      const resultUnits = this.checksFolders(unitPath)

      if (unitPath === units[units.length - 1]) {
        text.push(`      |     └── ${unitPath}`)
        this.logsUnitsPath({ logsUnits: resultUnits, text, unitEnd: true })
        text.push(`      └─`)
      } else {
        text.push(`      |     ├── ${unitPath}`)
        this.logsUnitsPath({ logsUnits: resultUnits, text })
      }
    }

    return text.join("\n")
  }

  /**
   * Adiciona os arquivos de log na árvore textual.
   * @param {LogsUnitsType} params - Estrutura contendo lista de logs, texto acumulado e flag de última unidade
   */

  private logsUnitsPath ({ logsUnits, text, unitEnd }: LogsUnitsType): void {
    // Adiciona logs da unidade fechamento da arvore
    for (const logs of logsUnits) {
      if (logs === logsUnits[logsUnits.length - 1]) {
        unitEnd ? 
          text.push(`      |            └──${logs}`) : 
          text.push(`      |     |      └──${logs}`)
      }else {
        unitEnd ? 
          text.push(`      |            ├──${logs}`) : 
          text.push(`      |     |      ├──${logs}`)
      }
    }
  }

  /**
   * Lê a subpasta Logs de uma unidade.
   * @param {string} path - Nome da unidade
   * @throws {AppError} Se a pasta Logs estiver vazia ou não puder ser lida.
   * @returns {string[]} Lista de arquivos da pasta Logs
   */

  private checksFolders (path: string): string[] {
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
   * Função principal: gera a árvore de unidades e seus arquivos de log.
   * @returns {string} Estrutura da árvore em formato de string
   */

    getFilesTree({ bodyDateStart, bodyDateEnd }: { bodyDateStart: string, bodyDateEnd: string }) {
      this.dateStart = bodyDateStart
      this.dateEnd = bodyDateEnd

      const units = this.readUnits()
      return this.structuralTree(units)
    }
}

  export { FileStructure }