import { GlpiBrowser } from "../glpi-browser"
import { GlpiCalleds } from "../glpi-calleds"
import { GlpiLogin } from "../glpi-login"
import { GlpiCreateCalled } from "../glpi-create-called"
import { Credentials } from "../interface/ICredentials"
import { dayOfWeek, incrementDay, readTaskCalled, removeFolderUnit, taskCalled, uniqueUnitsToHtml, validationCalledExists } from "@/services/glpi-task-called.services"
import standardizationUnits from "@/lib/standardization-units"
import { AppError } from "@/utils/AppError"
import { broadcastWss2 } from "@/utils/broadcast-ws"
import { GlpiValidationCalled } from "../glpi-validation-called"
import { DateType } from "@/schemas/log-analysis.schema"

/**
 * Fachada principal para operações no GLPI.
 * Centraliza o fluxo de login, criação, busca, tratamento de chamados e validação existente do chamado.
 */

export class GlpiFacade {
  private browser: GlpiBrowser
  private login: GlpiLogin
  private calleds: GlpiCalleds
  private createCalled: GlpiCreateCalled
  private validationCalled: GlpiValidationCalled
  private arrayCalledsExists: string[] = []

  /**
   * Inicializa a fachada com credenciais e dependências.
   * @param credentials Credenciais de acesso ao GLPI.
   */

  constructor (credentials: Credentials) {
    this.browser = new GlpiBrowser(credentials)
    this.login = new GlpiLogin(this.browser)
    this.calleds = new GlpiCalleds(this.browser)
    this.createCalled = new GlpiCreateCalled(this.browser)
    this.validationCalled = new GlpiValidationCalled(this.browser)
  }

 /**
 * Processa os chamados de todas as unidades dentro de um intervalo de datas.
 *
 * Fluxo da função:
 * 1. Inicializa o navegador e realiza login.
 * 2. Verifica se existem chamados na data específica (`existsCalledSpecificDate`); 
 *    se não houver, encerra o navegador e termina a execução.
 * 3. Para cada unidade encontrada:
 *    - Valida se a unidade está padronizada (`standardizationUnits`).
 *    - Seleciona a unidade na árvore do sistema.
 *    - Cria e abre um novo chamado.
 *    - Registra tarefas (logs) no chamado.
 *    - Fecha ou mantém aberto dependendo de erros.
 *    - Remove a pasta temporária da unidade.
 * 4. Encerra o navegador ao final da execução.
 *
 * @param {DateType} dataInterval - Objeto contendo as datas de início e fim para validação.
 * @returns {Promise<void>} Promessa resolvida quando todos os chamados forem processados.
 * @throws {AppError | Error} Caso ocorra falha no processamento ou na automação.
 */

  public async processCalleds(dataInterval: DateType) {
    await this.browser.setBrowser()
    await this.login.login()

    await this.validationCalledWeek(dataInterval)
    const calledsExists = await this.checkCalledValidation()
    if (!calledsExists) {
      this.arrayCalledsExists.length = 0
      return await this.browser.browserClose()
    }

    for (const unit of calledsExists) {
      broadcastWss2(`<p>Iniciado abertura de chamado ${unit}</p>`)
      const unitStandard = standardizationUnits[unit.toLowerCase()]

      if (!unitStandard) {
        this.browser.browserClose()
        broadcastWss2(`<p>❌ Unidade "${unit}" não encontrada no arquivo de padronização!</p>`)
        return
      }

      try {
        // Selecionar unidade na árvore
        await this.createCalled.treeUnits(standardizationUnits[unit.toLowerCase()].name)
        
        // Criar chamado
        const IdCalledCreate = await this.createCalled.newCalled(standardizationUnits[unit.toLowerCase()])
        
        // Abrir chamado recém-criado
        await this.calleds.calledSearch(IdCalledCreate)

        // Agrupa todos os logs refaturado com sucess e error
        const responseUnits = await readTaskCalled(unit)
        if(responseUnits.isError){
          // Inserir tarefa e fecha chamado => log sem Err
          await this.calleds.taskCalled(responseUnits.logs)
          await this.calleds.closeCalled()
        } else {
          // Inserir tarefa e deixa aberto o chamado => logs com Err
          await this.calleds.taskCalled(responseUnits.logs)
        }

        // Remover pasta temporária da unidade
        removeFolderUnit(unit)
        broadcastWss2('<p style="color: #22c55e">Chamado tramitado com sucesso <b>' + unit + "</b></p>")
        broadcastWss2(`<p>---------------------------------------</p>`)

      } catch (error: any) {
        broadcastWss2(`<p>❌ Erro ao processar unidade "${unit}": ` + error.message || error + "<p>")
        await this.browser.browserClose()
        throw new AppError(`Falha no processamento da unidade ${unit}`, 500)
      }
    }

    await this.browser.browserClose()
    broadcastWss2("<p>🎉 Processamento de chamados concluído!</p>")
  }

  /**
 * Valida os chamados existentes dentro de um intervalo semanal.
 *
 * Para cada dia no intervalo informado:
 * - Incrementa a data inicial.
 * - Verifica se já existem chamados cadastrados para a data.
 * - Caso existam, armazena em `this.arrayCalledsExists`.
 *
 * @param {DateType} dataInterval - Datas de início e fim para validação.
 * @returns {Promise<void>} Promise resolvida após a validação de todos os dias.
 */

  private async validationCalledWeek (dataInterval: DateType) {
    const week = dayOfWeek(dataInterval)
    this.validationCalled.searchCalledsValidation()

    for (let i: number = 0; i <= week; i++) { 
      const day = incrementDay({ day: i, dateStart: dataInterval.dateStart })

      // Valida se o chamado já existe na data especifica antes de abrir novo chamado e tramitar.
      const calledsExists = await this.validationCalled.existsCalledSpecificDate(day)
      calledsExists.length !== 0 && this.arrayCalledsExists.push(...calledsExists)
    }
  }

   /**
   * Verifica se existem chamados já registrados no período validado.
   *
   * - Se nenhum chamado foi encontrado, executa `taskCalled()`.
   * - Se houver chamados, exibe-os via WebSocket e recusa abertura de chamado já existente.
   *
   * @returns {Promise<false | string[]>} - Lista de unidades validadas
   *   ou `false` caso não existam arquivos/tarefas a serem enviados.
   */

  private async checkCalledValidation (): Promise<false | string[]> {
    if (this.arrayCalledsExists.length === 0) return taskCalled()

    const formattedUnits = uniqueUnitsToHtml(this.arrayCalledsExists)
    broadcastWss2(`
      <p>Existem chamados já registrados dentro do intervalo informado:</p
      <p style="color: #f8fafc">${formattedUnits.join("")}</p>
    `.trim())

    const resultValidation = await validationCalledExists(formattedUnits)
    if (!resultValidation) {
      broadcastWss2('Não tem arquivo para ser enviado!')
      return false
    }
    
    return resultValidation
  }
}