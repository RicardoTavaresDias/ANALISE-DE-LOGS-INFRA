import { Request, Response } from "express";
import { FileStructure } from "@/services/file-structure.services"
import { dateSchema } from "@/schemas/log-analysis.schema"
import { FileLogFacade } from "@/services/facade/facade-log-analysis";

class LogAnalysis {

/**
 * @swagger
 * /logs:
 *   post:
 *     summary: Estrutura de diretórios de logs por unidade
 *     description: Retorna a árvore de diretórios das unidades com os arquivos de log filtrados por intervalo de datas.
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dateStart
 *               - dateEnd
 *             properties:
 *               dateStart:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-05"
 *               dateEnd:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-09"
 *     responses:
 *       200:
 *         description: Arquivo Gerado com sucesso
 *       400:
 *         description: Erro de validação nas datas fornecidas
 *       404:
 *         description: Não há Arquivos.
 *       500:
 *         description: Erro interno ao processar logs ou ler pastas
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

      const fileLogFacade = new FileLogFacade()
      await fileLogFacade.processLogs(result)
      
      response.status(200).json({ message: 'Arquivo Gerado com sucesso' })
    }catch (error: any) {
      response.status(500).json({ message: error.message })
    }
  }
}

export { LogAnalysis }