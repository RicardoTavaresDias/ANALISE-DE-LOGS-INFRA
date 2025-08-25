import { Router } from "express";
import { logAnalysisRouter } from "./log-analysis.router"

export const router = Router()

router.use("/file", logAnalysisRouter)