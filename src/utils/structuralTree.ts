import { broadcastWss1 } from "./broadcast-ws"

type StructuralTreeType = {
  units: string
  totalUnits: string
 }

type LogsUnitsPathType = {
  logsUnits: string
  totalLogs: string
  unitEnd?: boolean
}


class TreeBuilder {
  private isUnits: boolean = true

  /**
   * Monta a árvore textual das unidades.
   * Exibe cada unidade formatada e envia via WebSocket.
   *
   * @param {Object} params - Parâmetros da unidade
   * @param {string} params.units - Nome da unidade atual
   * @param {string} params.totalUnits - Última unidade da lista (para saber quando fechar o ramo)
   * @returns {void}
   */

  public structuralTree ({ units, totalUnits }: StructuralTreeType) {
    this.isUnits && broadcastWss1(`├── unidade`)
    this.isUnits = false

    if (units === totalUnits) {
      broadcastWss1(`|     └── <span style="color: #1da5c2">${units}</span>`)
    } else {
      broadcastWss1(`|     ├── <span style="color: #1da5c2">${units}</span>`)
    }
  }

  /**
   * Monta a árvore textual dos arquivos de log de cada unidade.
   * Adiciona cada log ao formato hierárquico e envia via WebSocket.
   *
   * @param {Object} params - Parâmetros dos logs
   * @param {string} params.logsUnits - Nome do log atual
   * @param {string} params.totalLogs - Último log da unidade (para saber quando fechar o ramo)
   * @param {boolean} [params.unitEnd] - Indica se é a última unidade (ajusta a árvore)
   * @returns {void}
   */

  public logsUnitsPath ({ logsUnits, totalLogs, unitEnd }: LogsUnitsPathType): void {
    // Adiciona logs da unidade fechamento da arvore
    if (logsUnits === totalLogs) {
      unitEnd ?
        broadcastWss1(`|           └── <span style="color: #77767c">${logsUnits}</span>`) : 
        broadcastWss1(`|     |     └── <span style="color: #77767c">${logsUnits}</span>`)
    }else {
      unitEnd ?
        broadcastWss1(`|           ├── <span style="color: #77767c">${logsUnits}</span>`) : 
        broadcastWss1(`|     |     ├── <span style="color: #77767c">${logsUnits}</span>`)
    }

    unitEnd ? this.isUnits = true : this.isUnits
  }
}

export { TreeBuilder }