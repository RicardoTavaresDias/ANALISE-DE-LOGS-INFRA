import { Request, Response } from "express";
import { getFileLog } from "@/services/log-analysis.services"
import { FileStructure } from "@/services/file-structure.services"
import { dateSchema } from "@/schemas/log-analysis.schema"

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
      response.status(500).json({ message: error.message })
    }
  }

/**
 * @swagger
 * /log/files:
 *   post:
 *     summary: Árvore de diretórios das unidades
 *     description: Retorna a estrutura de pastas das unidades contendo os arquivos de logs.
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateStart:
 *                 type: string
 *                 example: "2025-08-05"
 *               dateEnd:
 *                 type: string
 *                 example: "2025-08-09"   
 *     responses:
 *       200:
 *         description: Estrutura de diretórios encontrada
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: |
 *               ├── unidade
 *               |     |── apura
 *               |     |      ├──log 2025-07-31.txt
 *               |     |      ├──log 2025-08-01.txt
 *               |     |      ├──log 2025-08-04.txt
 *               |     |      └──teste1.txt
 *               |     |── chacarasto
 *               |     |      ├──log 2025-08-05.txt
 *               |     |      ├──log 2025-08-06.txt
 *               |     |      └──log 2025-08-20.txt
 *               └─    └─
 *       500:
 *         description: Não foi possível ler a pasta Logs de determinada unidade
 *       404:
 *         description: Não há Arquivos.
 */
  
  async byLogsFiles (request: Request, response: Response) {
    try {
      const dateFile = dateSchema.safeParse(request.body)
      if (!dateFile.success) {
        return response.status(400).json({ 
          message: dateFile.error.issues.map(err => (err.path + " " + err.message)) 
        })
      }

      const fileStructure = new FileStructure()
      const result = fileStructure.getFilesTree({ 
        bodyDateStart: dateFile.data.dateStart, 
        bodyDateEnd: dateFile.data.dateEnd 
      })

      response.send(result)
    }catch (error: any) {
      response.status(500).json({ message: error.message })
    }
  }
}

export { LogAnalysis }