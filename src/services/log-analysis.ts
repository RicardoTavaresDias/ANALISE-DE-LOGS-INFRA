import fs from "node:fs"

export async function getFileLog () {
  const fileExistApura = fs.existsSync("./unidade/apura")
  if (!fileExistApura) {
    throw new Error("Arquivo não encontrado.")
  }

  const unidadeApura = await fs.promises.readFile("./unidade/apura/Logs/log 2025-08-05.txt", "utf16le")
  const textFile = unidadeApura.split(/\r?\n/)

  let scanText: string[] = []
  let logError: string[][] = []

  for (const line of textFile) {
    if (line.includes("*** Um novo backup iniciou.  Número de tarefas na fila: 1 ***")) {
      scanText = []
      scanText.push("-------------------------INTERVALO---------------------------------\n\n" + line)
    } else {
      scanText.push("\n" + line)
    }

    if (line.includes("*** Backup terminado.")) {
      if (scanText.some(err => err.includes("ERR "))) {
        scanText.push("\n\n-------------------------INTERVALO---------------------------------\n\n")
        logError.push(scanText)
      } 

      scanText = []
    }
  }

  await fs.promises.writeFile("./unidade/apura/Logs/teste.txt", logError.flat())

  return "Salvo com sucesso"
}

export function files () {
  const result = fs.readdirSync("./unidade/apura/Logs")

  return result
}
