import { AppError } from "@/utils/AppError"
import fs from "node:fs"

/**
 * Lê um arquivo de log de uma unidade específica.
 * 
 * @param {string} unit - Nome da unidade
 * @param {string} logs - Nome do arquivo de log
 * @returns {Promise<string[]>} Linhas do arquivo de log
 */

export async function readLogFile (unit: string, logs: string) {
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

export function parseLogs (textFile: string[]): string[] {
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
      arrayLogs.push("\n###\n")
      arrayLogs.push("-------------------------INTERVALO---------------------------------\n")
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
 * Separa os logs processados em dois grupos:
 *  - "success": trechos de log sem erros
 *  - "error": trechos de log que contêm erros
 *
 * @param {string[]} arrayLogsError - Lista de trechos de log processados
 * @returns {{ success: string, error: string }} Logs separados em sucesso e erro
 */

export function splitLogs (arrayLogsError: string[]): { success: string, error: string } {
  const refactoringLogs = arrayLogsError.join("").split("###")

  return {
    success: refactoringLogs.filter(value => !value.includes("ERR ")).join("\n").trim(),
    error: refactoringLogs.filter(value => value.includes("ERR ")).join("\n").trim()
  }
}

/**
 * Cria a pasta temporária "./tmp" caso não exista e salva os logs processados em um arquivo.
 *
 * @param {string} path - Caminho completo do arquivo onde será salvo
 * @param {string} content - Conteúdo que será gravado no arquivo
 * @throws {AppError} - Se ocorrer erro ao escrever no arquivo
 * @returns {Promise<void>} - Não retorna valor; apenas confirma a gravação
 */

export async function saveFile (path: string, content: string) {
  const fileExist = fs.existsSync("./tmp")
  if (!fileExist) {
    fs.mkdirSync("./tmp")
  }

  try { 
    await fs.promises.writeFile(path, content, "utf-8")
  } catch (error: any) {
    throw new AppError(error.message, 500)
  }
}