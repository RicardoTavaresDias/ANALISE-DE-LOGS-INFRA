import { Router } from "express";
import { logAnalysisRouter } from "./log-analysis.router"
import { loginRouter } from "./login.router"

export const router = Router()

router.use("/", loginRouter)
router.use("/logs", logAnalysisRouter)