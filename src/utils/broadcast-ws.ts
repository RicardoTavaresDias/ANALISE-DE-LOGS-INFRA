import { ws } from '@/server';

// Envia para todos clientes conectados
function broadcast(line: string) {
  ws.clients.forEach((client) => {
    client.send(line)
  })
}

export { broadcast }