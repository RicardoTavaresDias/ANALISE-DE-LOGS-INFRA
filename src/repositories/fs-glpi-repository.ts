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

    const readResult = await fs.promises.readFile(`./tmp/${unit}}`, "utf-8") 
    return readResult
  }
}