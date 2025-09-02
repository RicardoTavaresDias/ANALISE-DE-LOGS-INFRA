import { TreeBuilder } from "@/utils/structuralTree"
import { broadcast } from "@/utils/broadcast-ws"
import { parseLogs, splitLogs } from "./log-analysis.services"
import { AppError } from "@/utils/AppError"
import { FsRepository } from "@/repositories/fs-repository"

type DataUnitsLogsType = {
  units: string
  logs: string[]
}

/**
 * Facade para processar arquivos de log de múltiplas unidades.
 * 
 * Esta classe centraliza a complexidade de:
 *  - Montar a árvore de diretórios das unidades
 *  - Ler arquivos de log
 *  - Filtrar logs com possíveis erros
 *  - Separar logs em sucesso e erro
 *  - Salvar os logs processados em arquivos na pasta "./tmp"
 */

class FileLogFacade {
  private treeBuilder: TreeBuilder
  private fsRepository: FsRepository
  private arrayDataSave: string[] = []

  constructor() {
    this.treeBuilder = new TreeBuilder()
    this.fsRepository = new FsRepository()
  }

   /**
   * Processa os logs de múltiplas unidades.
   *
   * Para cada unidade:
   *  - Gera representação da árvore de diretórios (TreeBuilder)
   *  - Lê os arquivos de log do sistema de arquivos (FsRepository)
   *  - Faz parsing e acumula o conteúdo (parseLogs)
   *  - Em caso de erro de leitura/parsing lança um AppError
   *  - Ao final de cada unidade:
   *      - Separa logs em sucesso/erro (splitLogs)
   *      - Salva em "./tmp/[unidade]_success.txt" e "./tmp/[unidade]_error.txt"
   *  - Ao final do processo de todas as unidades envia notificação via WebSocket
   *
   * @param {DataUnitsLogsType[]} dataUnitsLogs - Lista de unidades e seus arquivos de log
   * @returns {Promise<void>} Promise resolvida após processar e salvar todos os logs
   * @throws {AppError} Se houver falha ao ler ou processar algum log
   */

  async processLogs (dataUnitsLogs: DataUnitsLogsType[]) {
    const totalUnits = dataUnitsLogs.map(value => value.units)
    
    for (const data of dataUnitsLogs) {
      this.treeBuilder.structuralTree({ units: data.units, totalUnits: totalUnits[totalUnits.length - 1] })

      for (const log of data.logs) {
        try {
          const textFile = await this.fsRepository.readLogFile(data.units, log)
          const logFile = parseLogs(textFile)

          const totalLogs = data.logs.map(value => value)
          this.treeBuilder.logsUnitsPath({ 
            logsUnits: log, 
            totalLogs: totalLogs[totalLogs.length - 1], 
            unitEnd:  totalUnits[totalUnits.length - 1] === data.units
          })
          
          this.arrayDataSave.push(logFile.join(""))
        } catch (error) {
          throw new AppError(`Erro ao processar ${data.units}/${log}: ${error}`, 500)
        }
      }

      const { success, error } = splitLogs(this.arrayDataSave)
      await this.fsRepository.saveFile(`./tmp/${data.units}_success.txt`, success)
      await this.fsRepository.saveFile(`./tmp/${data.units}_error.txt`, error)
      this.arrayDataSave = []
    }

    // broadcast('\n<span style="color: #1aab79">✅ Arquivo Gerado com sucesso.</span>')
  }
}

export { FileLogFacade }