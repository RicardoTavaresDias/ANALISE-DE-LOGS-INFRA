import { TreeBuilder } from "@/utils/structuralTree"
import { broadcast } from "@/utils/broadcast-ws"
import { parseLogs, readLogFile, saveFile, splitLogs } from "./log-analysis.services"

type DataUnitsLogsType = {
  units: string
  logs: string[]
}

/**
 * Lê múltiplos arquivos de log, processa e salva os resultados por unidade.
 * Para cada unidade:
 *  - Cria a árvore de diretórios
 *  - Lê os arquivos de log
 *  - Filtra e separa logs em sucesso/erro
 *  - Salva em "./tmp/[unidade]_success.txt" e "./tmp/[unidade]_error.txt"
 *
 * @param {DataUnitsLogsType[]} dataUnitsLogs - Lista de unidades e respectivos arquivos de log
 * @returns {Promise<void>}
 */

async function getFileLog (dataUnitsLogs: DataUnitsLogsType[]) {
  let arrrayDataSave: string[] = []
  const totalUnits = dataUnitsLogs.map(value => value.units)

  const treeBuilder = new TreeBuilder()
  
  for (const data of dataUnitsLogs) {
    treeBuilder.structuralTree({ units: data.units, totalUnits: totalUnits[totalUnits.length - 1] })

    for (const log of data.logs) {
      const textFile = await readLogFile(data.units, log)
      const logFile = parseLogs(textFile)

      const totalLogs = data.logs.map(value => value)
      treeBuilder.logsUnitsPath({ 
        logsUnits: log, 
        totalLogs: totalLogs[totalLogs.length - 1], 
        unitEnd:  totalUnits[totalUnits.length - 1] === data.units
      })
      
      arrrayDataSave.push(logFile.join(""))
    }

    const { success, error } = splitLogs(arrrayDataSave)
    await saveFile(`./tmp/${data.units}_success.txt`, success)
    await saveFile(`./tmp/${data.units}_error.txt`, error)
    arrrayDataSave = []
  }

  return broadcast('\n<span style="color: #1aab79">✅ Arquivo Gerado com sucesso.</span>')
}

export { getFileLog }