import { Request, Response } from "express";
import { getFileLog, files } from "@/services/log-analysis"

class LogAnalysis {

/**
 * @swagger
 * /log:
 *   get:
 *     summary: Analisa arquivos de log
 *     description: Executa a varredura dos arquivos de log da unidade e retorna apenas os registros que apresentam erros.
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Análise concluída com sucesso e retorno dos logs com erro.
 */

  async get (request: Request, response: Response) {
    try {
      await getFileLog()

      response.status(200).json({ message: "Análise concluída com sucesso e retorno dos logs com erro." })
    } catch (error: any) {
      console.log(error)
      response.status(500).json({ message: error.message })
    }
  }


  ///
  async getFiles (request: Request, response: Response) {
    const result = files()

    response.status(200).json(result)
  }
}

export { LogAnalysis }