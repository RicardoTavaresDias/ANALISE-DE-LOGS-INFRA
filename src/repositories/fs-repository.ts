import { AppError } from "@/utils/AppError"
import fs from "node:fs"
import { env } from "@/config/env"

class FsRepository {

  /**
   * Verifica se um arquivo ou diretório existe no caminho informado.
   *
   * @param {string} path - Caminho do arquivo ou diretório
   * @returns {boolean} - Retorna true se o arquivo existir, caso contrário false
   */

  private existsFile (path: string) {
    const fileExist = fs.existsSync(path)

    return fileExist
  }

  /**
   * Cria um diretório caso ele não exista.
   *
   * @param {string} path - Caminho do diretório
   * @returns {void}
   */

  private mkdirFile (path: string) {
    if (!this.existsFile(path)) {
      fs.mkdirSync(path)
    }
  }

  /**
   * Lê uma pasta específica e retorna a lista de arquivos/unidades encontrados.
   *
   * @param {string} path - Caminho da pasta a ser lida
   * @throws {AppError} - Se a pasta não existir, estiver vazia ou não puder ser lida
   * @returns {string[]} - Lista de arquivos ou unidades encontradas no diretório
   */

  public showFilesFolder (path: string): string[] {
    try {
      const result = fs.readdirSync(path)
      if(result.length === 0) throw new AppError("Não há Arquivos.", 404)

      return result
    } catch {
      throw new AppError(`Não foi possível ler a pasta ${path}`, 500)
    }
  }

  /**
   * Lê um arquivo de log específico dentro de uma unidade.
   *
   * @param {string} unit - Nome da unidade
   * @param {string} logs - Nome do arquivo de log
   * @throws {AppError} - Se o arquivo não existir ou ocorrer erro na leitura
   * @returns {Promise<string[]>} - Conteúdo do log em formato de array de linhas
   */

  public async readLogFile (unit: string, logs: string) {
    try {
      const result = this.existsFile(`${env.PATCHFILE}/${unit}`)
      if (!result) {
        throw new AppError("Arquivo não encontrado.", 404)
      }

      const units = await fs.promises.readFile(`${env.PATCHFILE}/${unit}/Logs/${logs}`, "utf16le")
      const textFile = units.split(/\r?\n/)

      return textFile
    } catch (error: any) {
      throw new AppError(error.message, 500)
    }
  }

 /**
   * Cria a pasta `./tmp` e uma subpasta com o nome de `units`, e salva o conteúdo em um arquivo no caminho especificado.
   *
   * @param {string} path - Caminho completo do arquivo onde será salvo.
   * @param {string} content - Conteúdo a ser gravado.
   * @param {string} units - Nome da subpasta dentro de `./tmp`.
   * @throws {AppError} - Se ocorrer erro ao salvar o arquivo.
   * @returns {Promise<void>} - Retorna uma promessa resolvida quando a gravação for concluída.
   */

  public async saveFile (path: string, content: string, units: string) {
    if (content.length === 0) {
      return
    }

    this.mkdirFile('./tmp')
    this.mkdirFile(`./tmp/${units}`)

    try { 
      await fs.promises.writeFile(path, content, "utf-8")
    } catch (error: any) {
      throw new AppError(error.message, 500)
    }
  }
}

export { FsRepository }