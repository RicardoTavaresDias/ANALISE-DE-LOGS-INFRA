import { app } from "./app"
import { env } from "@/config/env"
import { WebSocketServer } from "ws";

const server = app.listen(env.PORT, () => console.log("Server in running port " + env.PORT))

const wss1 = new WebSocketServer({ noServer: true })
const wss2 = new WebSocketServer({ noServer: true })

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws1") {
    wss1.handleUpgrade(req, socket, head, (ws) => {
      wss1.emit("connection", ws, req)
    })
  } else if (req.url === "/ws2") {
    wss2.handleUpgrade(req, socket, head, (ws) => {
      wss2.emit("connection", ws, req)
    })
  } else {
    socket.destroy()
  }
})

export { wss1, wss2 }