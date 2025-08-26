import { Router } from "express"
import { LoginController } from "@/controller/login.controller"

export const loginRouter = Router()
const loginController = new LoginController()

loginRouter.post("/", loginController.session)