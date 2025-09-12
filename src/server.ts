import { app } from "./app"
import { env } from "@/config/env"
import { WebSocketServer } from "ws";

const server = app.listen(env.PORT, () => console.log("Server in running port " + env.PORT))

/**
 * WebSocketServer para conexões no endpoint `/ws1`.
 * @type {WebSocketServer}
 */

const wss1 = new WebSocketServer({ noServer: true })

/**
 * WebSocketServer para conexões no endpoint `/ws2`.
 * @type {WebSocketServer}
 */

const wss2 = new WebSocketServer({ noServer: true })

// Gerencia conexões WebSocket em diferentes endpoints
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