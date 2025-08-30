import { ws } from '@/server';

// Envia para todos clientes conectados
function broadcast(message: any) {
  ws.clients.forEach((client) => {
    client.send(JSON.stringify(message))
  })
}

export { broadcast }