import { AppError } from "@/utils/AppError"
import fs from "node:fs"

export class FsGlpiRepository {
  private existsFileTmp (path: string) {
    const fileExist = fs.existsSync(path)

    return fileExist
  }

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

  async read (unit: string) {
    const existTmp = this.existsFileTmp(`./tmp`)
    if (!existTmp) {
      throw new AppError("Arquivo não encontrado.", 404)
    }

    const contentSucess = await fs.promises.readFile(`./tmp/${unit}/${unit}_success.txt`, "utf-8")
    const contentError = await fs.promises.readFile(`./tmp/${unit}/${unit}_error.txt`, "utf-8") 

    return { contentSucess, contentError }
  }

  removeFolder (unit: string) {
    if (!this.existsFileTmp(`./tmp/${unit}`)) {
      throw new AppError(`A pasta ${unit} não existe para ser excluido.`, 404)
    }
    
    fs.promises.rm(`./tmp/${unit}`, { recursive: true })
  }
}