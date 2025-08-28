import { AppError } from "@/utils/AppError"
import fs from "node:fs"

/**
 * Lê um arquivo de log específico dentro de ./unidade/apura/Logs.
 * @throws {AppError} Se a pasta "apura" não for encontrada.
 * @returns {Promise<string[]>} Conteúdo do log em array de linhas
 */

async function readLogFile () {
  const fileExistApura = fs.existsSync("./unidade/apura")
  if (!fileExistApura) {
    throw new AppError("Arquivo não encontrado.", 404)
  }

  const unidadeApura = await fs.promises.readFile("./unidade/apura/Logs/log 2025-08-05.txt", "utf16le")
  const textFile = unidadeApura.split(/\r?\n/)

  return textFile
}

/**
 * Filtra e estrutura apenas os trechos de log com possíveis erros.
 * 
 * @param {string[]} textFile - Linhas do arquivo de log
 * @returns {string[]} Lista de trechos de log contendo erros
 */

function parseLogs (textFile: string[]) {
  
  let arrayLogs: string[] = []
  let arrayLogsError: string[] = []

  let isBlocked: boolean = false
  let hasError: boolean = false

  const regexBackupStart = new RegExp("\\bUm novo backup iniciou.  Número de tarefas na fila: 1\\b")
  const regexTaskRunning = new RegExp('\\bA tarefa está agora\\b')
  const regexBackupError = new RegExp("\\bERR \\b")
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
 * Salva os logs filtrados com erro em um arquivo "teste.txt".
 * 
 * @param {string[]} arrayLogsError - Lista de logs com erro
 * @returns {Promise<void>}
 */

async function saveLogResult (arrayLogsError: string[]) {
  const refactoringLogs = arrayLogsError.join("").split("-------------------------INTERVALO---------------------------------")
  const successfullyRemovingLogs = refactoringLogs.filter(value => value.includes("ERR ")).join("\n")

  // ******** Mudar para successfullyRemovingLogs ************************
  await fs.promises.writeFile("./tmp/teste.txt", arrayLogsError.join(""))
}

/**
 * Função principal:
 * - Lê o arquivo de log
 * - Filtra apenas erros
 * - Salva resultado em arquivo
 */

async function getFileLog () {
  const textFile = await readLogFile()
  const result = parseLogs(textFile)
  saveLogResult(result)

  return
}

export { getFileLog }