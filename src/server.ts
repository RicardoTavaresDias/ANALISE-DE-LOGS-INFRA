import { app } from "./app"
import { env } from "@/config/env"
import { WebSocketServer } from "ws";

const server = app.listen(env.PORT, () => console.log("Server in running port " + env.PORT))

const ws = new WebSocketServer({ server })

export { ws }