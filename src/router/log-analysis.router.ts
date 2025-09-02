import { Router } from "express";
import { LogAnalysis } from "@/controller/log-analysis.controller";

export const logAnalysisRouter = Router()
const logAnalysisController = new LogAnalysis() 

logAnalysisRouter.post("/", logAnalysisController.byLogsFiles)