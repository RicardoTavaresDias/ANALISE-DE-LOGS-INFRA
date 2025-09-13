import { AppError } from "@/utils/AppError"
import fs from "node:fs"

/**
 * Repositório responsável por operações de leitura e remoção
 * de arquivos temporários do GLPI.
 */

export class FsGlpiRepository {

   /**
   * Verifica se o arquivo ou pasta existe no caminho informado.
   * @param {string} path - Caminho do arquivo/pasta.
   * @returns {boolean} Verdadeiro se existir.
   * @public
   */

  public existsFileTmp (path: string) {
    const fileExist = fs.existsSync(path)

    return fileExist
  }

  /**
   * Lista os arquivos de uma pasta temporária.
   * @param {string} path - Caminho da pasta a ser verificada.
   * @throws {AppError} Se a pasta não existir ou estiver vazia.
   * @returns {string[]} Lista de arquivos encontrados.
   */

  showFolderTmp (path: string) {
    const exist = this.existsFileTmp(path)
    if(!exist) {
      throw new AppError(`Não há Arquivo ${path}`, 404)
    }

    try {
      const result = fs.readdirSync(path)
      if(result.length === 0) throw new AppError("Não há Arquivos.", 404)

      return result
    } catch (error: any) {
      throw new AppError(error.message, 500)
    }
  }

   /**
   * Lê os arquivos de sucesso e erro de uma unidade.
   * @param {string} unit - Nome da unidade (ex.: "setor01").
   * @throws {AppError} Se não encontrar a pasta temporária.
   * @returns {Promise<{contentSucess?: string, contentError?: string}>} Conteúdo dos arquivos.
   */

  async read (unit: string) {
    const existTmp = this.existsFileTmp(`./tmp`)
    if (!existTmp) {
      throw new AppError("Arquivo não encontrado.", 404)
    }

    if (!this.existsFileTmp(`./tmp/${unit}/${unit}_success.txt`)) {
      const contentError = await fs.promises.readFile(`./tmp/${unit}/${unit}_error.txt`, "utf-8") 
      return { contentError }
    }

    if (!this.existsFileTmp(`./tmp/${unit}/${unit}_error.txt`)) {
      const contentSucess = await fs.promises.readFile(`./tmp/${unit}/${unit}_success.txt`, "utf-8")
      return { contentSucess }
    }

    const contentSucess = await fs.promises.readFile(`./tmp/${unit}/${unit}_success.txt`, "utf-8")
    const contentError = await fs.promises.readFile(`./tmp/${unit}/${unit}_error.txt`, "utf-8") 
    
    return { contentSucess, contentError }
  }

   /**
   * Remove a pasta temporária de uma unidade.
   * @param {string} unit - Nome da unidade.
   * @throws {AppError} Se a pasta não existir.
   */

  async removeFolder (unit: string) {
    if (!this.existsFileTmp(`./tmp/${unit}`)) {
      throw new AppError(`A pasta ${unit} não existe para ser excluido.`, 404)
    }
    
    await fs.promises.rm(`./tmp/${unit}`, { recursive: true })
  }
}