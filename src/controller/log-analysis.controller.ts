import { Request, Response } from "express";
import { getFileLog, files } from "@/services/log-analysis"

class LogAnalysis {
  async get (request: Request, response: Response) {
    try {
      const result = await getFileLog()

      response.status(200).json({ message: result })
    } catch (error: any) {
      console.log(error)
      response.status(500).json({ message: error.message })
    }
  }

  async getFiles (request: Request, response: Response) {
    const result = files()

    response.status(200).json(result)
  }
}

export { LogAnalysis }