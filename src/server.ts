import { app } from "./app"
import { env } from "@/config/env"
import { WebSocketServer } from "ws";

const server = app.listen(env.PORT, () => console.log("Server in running port " + env.PORT))

const wss1 = new WebSocketServer({ server, path: '/ws1' })

export { wss1 }