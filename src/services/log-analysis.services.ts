import regex from "@/lib/regex"

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

  for (const line of textFile) {

    if (regex.BackupStart.test(line)) {
      arrayLogs.push("\n###\n")
      arrayLogs.push("-------------------------INTERVALO---------------------------------\n")
      arrayLogs.push("\n" + line)
      isBlocked = true
    } else if (regex.TaskRunning.test(line)) {
      arrayLogs.push("\n" + line)
      arrayLogsError.push(...arrayLogs)
      arrayLogs.length = 0
      isBlocked = false
    } else if (isBlocked) {
      arrayLogs.push("\n" + line)
    } else if (regex.BackupError.test(line)) {
      arrayLogsError.push("\n" + line)
    } else if (regex.AfterError.test(line)) {
      arrayLogsError.push("\n" + line)
      hasError = true
    } else if (regex.BackupFinish.test(line)) {
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