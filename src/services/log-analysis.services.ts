import { AppError } from "@/utils/AppError"
import { broadcast } from "@/utils/broadcast-ws"
import { TreeBuilder } from "@/utils/structuralTree"
import fs from "node:fs"

/**
 * Lê um arquivo de log de uma unidade específica.
 * 
 * @param {string} unit - Nome da unidade
 * @param {string} logs - Nome do arquivo de log
 * @returns {Promise<string[]>} Linhas do arquivo de log
 */

async function readLogFile (unit: string, logs: string) {
  const fileExist = fs.existsSync(`./unidade/${unit}`)
  if (!fileExist) {
    throw new AppError("Arquivo não encontrado.", 404)
  }

  const units = await fs.promises.readFile(`./unidade/${unit}/Logs/${logs}`, "utf16le")
  const textFile = units.split(/\r?\n/)

  return textFile
}

/**
 * Filtra e estrutura apenas os trechos de log com possíveis erros.
 * 
 * @param {string[]} textFile - Linhas do arquivo de log
 * @returns {string[]} Lista de trechos de log contendo erros
 */

function parseLogs (textFile: string[]): string[] {
  let arrayLogs: string[] = []
  let arrayLogsError: string[] = []

  let isBlocked: boolean = false
  let hasError: boolean = false

  const regexBackupStart = new RegExp("\\bUm novo backup iniciou.  Número de tarefas na fila: 1\\b")
  const regexTaskRunning = new RegExp('\\bA tarefa está agora\\b')
  const regexBackupError = new RegExp("\\bERR \\b")
  const regexAfterError = new RegExp("\\bRevertendo o módulo de trabalho\\b")
  const regexBackupFinish = new RegExp("\\bBackup terminado.  \\b")

  for (const line of textFile) {

    if (regexBackupStart.test(line)) {
      arrayLogs.push("\n\n-------------------------INTERVALO---------------------------------\n")
      arrayLogs.push("\n" + line)
      isBlocked = true
    } else if (regexTaskRunning.test(line)) {
      arrayLogs.push("\n" + line)
      arrayLogsError.push(...arrayLogs)
      arrayLogs.length = 0
      isBlocked = false
    } else if (isBlocked) {
      arrayLogs.push("\n" + line)
    } else if (regexBackupError.test(line)) {
      arrayLogsError.push("\n" + line)
    } else if (regexAfterError.test(line)) {
      arrayLogsError.push("\n" + line)
      hasError = true
    } else if (regexBackupFinish.test(line)) {
      arrayLogsError.push("\n" + line)
      hasError = false
    } else if (hasError) {
      arrayLogsError.push("\n" + line)
    }
  }

  return arrayLogsError
}

/**
 * Salva os trechos de log com erros em um arquivo na pasta ./tmp
 * 
 * @param {string[]} arrayLogsError - Lista de trechos de log com erros
 * @param {string} unit - Nome da unidade
 */

async function saveLogResult (arrayLogsError: string[], unit: string) {
  const refactoringLogs = arrayLogsError.join("").split("-------------------------INTERVALO---------------------------------")
  const successfullyRemovingLogs = refactoringLogs.filter(value => value.includes("ERR ")).join("\n")
  const errorRemovingLogs = refactoringLogs.filter(value => !value.includes("ERR ")).join("\n")

  // ******** Mudar para successfullyRemovingLogs e errorRemovingLogs ************************
  const fileExist = fs.existsSync("./tmp")
  if (!fileExist) {
    fs.mkdirSync("./tmp")
  }
  
  // await fs.promises.writeFile(`./tmp/${unit}_ERROR.txt`, successfullyRemovingLogs, "utf-8")
  // await fs.promises.writeFile(`./tmp/${unit}_SUCCESS.txt`, errorRemovingLogs, "utf-8")

  await fs.promises.writeFile(`./tmp/${unit}.txt`, arrayLogsError.join(""), "utf-8")
}

type DataUnitsLogsType = {
  units: string
  logs: string[]
}

/**
 * Lê múltiplos arquivos de log, processa e salva os resultados por unidade.
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

    saveLogResult(arrrayDataSave, data.units)
    arrrayDataSave = []
  }

  return broadcast('\n<span style="color: #1aab79">✅ Arquivo Gerado com sucesso.</span>')
}

export { getFileLog }