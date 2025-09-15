import { TreeBuilder } from "@/utils/structuralTree"
import { parseLogs, splitLogs } from "../log-analysis.services"
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
   * Processa logs de múltiplas unidades, realizando parsing e separando os logs em sucesso/erro.
   *
   * Para cada unidade:
   *  - Gera árvore de diretórios (TreeBuilder)
   *  - Lê e faz parsing dos logs (FsRepository, parseLogs)
   *  - Lança um erro (AppError) em caso de falha no processo
   *  - Separa os logs em sucesso e erro, e salva em arquivos separados
   *  - No final, envia notificação via WebSocket
   *
   * @param {DataUnitsLogsType[]} dataUnitsLogs - Lista com unidades e seus arquivos de log
   * @returns {Promise<void>} - Promise resolvida após salvar todos os logs
   * @throws {AppError} - Se ocorrer falha ao ler ou processar os logs
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
      await this.fsRepository.saveFile(`./tmp/${data.units}/${data.units}_success.txt`, success, data.units)
      await this.fsRepository.saveFile(`./tmp/${data.units}/${data.units}_error.txt`, error, data.units)
      this.arrayDataSave.length = 0
    }
  }
}

export { FileLogFacade }