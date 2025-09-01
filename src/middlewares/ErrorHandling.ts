import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { AppError } from "@/utils/AppError"

export function ErrorHandling(error: any, request: Request, response: Response, next: NextFunction) {
  if(error instanceof AppError){
    response.status(error.statusCode).json({ message: error.message })
    return
  }

  if(error instanceof ZodError){
    response.status(400).json({ message: "validation error",  issues: error.format() })
    return
  }

    response.status(500).json({ message: error.message, error: error.meta })
    return
  }