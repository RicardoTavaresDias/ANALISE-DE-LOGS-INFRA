import { AppError } from "@/utils/AppError"
import fs from "node:fs"

// Leitura do arquivo de logs
async function readLogFile () {
  const fileExistApura = fs.existsSync("./unidade/apura")
  if (!fileExistApura) {
    throw new AppError("Arquivo não encontrado.", 404)
  }

  const unidadeApura = await fs.promises.readFile("./unidade/apura/Logs/log 2025-08-05.txt", "utf16le")
  const textFile = unidadeApura.split(/\r?\n/)

  return textFile
}

// Restruturando logs somente com erros
function parseLogs (textFile: string[]) {
  
  let arrayLogs: string[] = []
  let arrayLogsError: string[] = []

  let isBlocked: boolean = false
  let hasError: boolean = false

  const blockInitial = new RegExp("\\bUm novo backup iniciou.  Número de tarefas na fila: 1\\b")
  const blockGLOBALROOT = new RegExp('\\bA tarefa está agora\\b')
  const blockError = new RegExp("\\bERR \\b")
  const blockEnd = new RegExp("\\bBackup terminado.  \\b")

  for (const line of textFile) {

    if (blockInitial.test(line)) {
      arrayLogs.push("\n\n-------------------------INTERVALO---------------------------------\n")
      arrayLogs.push("\n" + line)
      isBlocked = true
    } else if (blockGLOBALROOT.test(line)) {
      arrayLogs.push("\n" + line)
      arrayLogsError.push(...arrayLogs)
      arrayLogs.length = 0
      isBlocked = false
    } else if (isBlocked) {
      arrayLogs.push("\n" + line)
    } else if (blockError.test(line)) {
      arrayLogsError.push("\n" + line)
      hasError = true
    } else if (blockEnd.test(line)) {
      arrayLogsError.push("\n" + line)
      hasError = false
    } else if (hasError) {
      arrayLogsError.push("\n" + line)
    }

  }

  return arrayLogsError
}

// Salvando logs com error em arquivo txt
async function saveLogResult (arrayLogsError: string[]) {
   //const teste = arrayLogsError.join("").split("-------------------------INTERVALO---------------------------------")
  //console.log(teste.filter(value => value.includes("ERR ")).join("\n"))

  await fs.promises.writeFile("./unidade/apura/Logs/teste.txt", arrayLogsError.join(""))
}

async function getFileLog () {
  const textFile = await readLogFile()
  const result = parseLogs(textFile)
  saveLogResult(result)

  return
}


///
function files () {
  const result = fs.readdirSync("./unidade/apura/Logs")

  return result
}

export { getFileLog, files }