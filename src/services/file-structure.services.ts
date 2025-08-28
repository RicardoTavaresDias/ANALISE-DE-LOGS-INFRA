import { AppError } from "@/utils/AppError";
import fs from "node:fs"

/**
 * Lê a pasta ./unidade e retorna as unidades encontradas.
 * @throws {AppError} Se a pasta estiver vazia ou não puder ser lida.
 * @returns {string[]} Lista de unidades
 */

function readUnits(): string[] {
  try {
    const result = fs.readdirSync("./unidade");
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

function structuralTree (units: string[]): string {
  let text = [`      ├── unidade`]

  // Adiciona pastas dentro da unidade
  for(const unitPath of units) {
    const resultUnits = checksFolders(unitPath)

    if (unitPath === units[units.length - 1]) {
      text.push(`      |     └── ${unitPath}`)
      logsUnitsPath({ logsUnits: resultUnits, text, unitEnd: true })
      text.push(`      └─`)
    } else {
      text.push(`      |     ├── ${unitPath}`)
      logsUnitsPath({ logsUnits: resultUnits, text })
    }
  }

  return text.join("\n")
}

type LogsUnitsType = {
  logsUnits: string[]
  text: string[]
  unitEnd?: boolean
}

/**
 * Adiciona os arquivos de log na árvore textual.
 * @param {LogsUnitsType} params - Estrutura contendo lista de logs, texto acumulado e flag de última unidade
 */

function logsUnitsPath ({ logsUnits, text, unitEnd }: LogsUnitsType): void {
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

 function checksFolders (path: string): string[] {
    try {
      const result =  fs.readdirSync(`./unidade/${path}/Logs`)
      if(result.length === 0) throw new AppError("Não há Arquivos.", 404)

      return result
    } catch {
      throw new AppError(`Não foi possível ler a pasta Logs de ${path}`, 500);
    }
  }

  /**
 * Função principal: gera a árvore de unidades e seus arquivos de log.
 * @returns {string} Estrutura da árvore em formato de string
 */

  function getFilesTree(): string {
    const units = readUnits()
    return structuralTree(units)
  }

  export { getFilesTree }