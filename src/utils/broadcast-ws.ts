import { wss1, wss2 } from '@/server';

// Envia para todos clientes conectados
function broadcastWss1(line: string) {
  wss1.clients.forEach((client) => {
    client.send(line)
  })
}

function broadcastWss2(line: string) {
  wss2.clients.forEach((client) => {
    client.send(line)
  })
}

export { broadcastWss1, broadcastWss2 }