import { GlpiBrowser } from "./glpi-browser"
import { GlpiCalleds } from "./glpi-calleds"
import { GlpiLogin } from "./glpi-login"
import { GlpiCreateCalled } from "./glpi-create-called"
import { Credentials } from "./interface/ICredentials"
import { taskCalled, readTaskCalled, removeFolderUnit } from "@/services/glpi-task-called.services"
import standardizationUnits from "@/lib/standardization-units"
import { AppError } from "@/utils/AppError"
import { broadcastWss2 } from "@/utils/broadcast-ws"

/**
 * Fachada principal para operações no GLPI.
 * Centraliza o fluxo de login, criação, busca e tratamento de chamados.
 */

export class GlpiFacade {
  private browser: GlpiBrowser
  private login: GlpiLogin
  private calleds: GlpiCalleds
  private createCalled: GlpiCreateCalled

  /**
   * Inicializa a fachada com credenciais e dependências.
   * @param credentials Credenciais de acesso ao GLPI.
   */

  constructor (credentials: Credentials) {
    this.browser = new GlpiBrowser(credentials)
    this.login = new GlpiLogin(this.browser)
    this.calleds = new GlpiCalleds(this.browser)
    this.createCalled = new GlpiCreateCalled(this.browser)
  }

  /**
   * Processa os chamados de todas as unidades encontradas:
   *  - Abre o navegador e autentica.
   *  - Para cada unidade:
   *    - Valida padronização da unidade.
   *    - Seleciona a unidade na árvore.
   *    - Cria e abre um novo chamado.
   *    - Registra tarefas (logs) no chamado.
   *    - Fecha ou mantém aberto dependendo dos erros.
   *    - Remove a pasta temporária da unidade.
   *  - Encerra o navegador ao final.
   * 
   * @throws {AppError} Se ocorrer falha no processamento de uma unidade.
   */

  public async processCalleds() {
    const foldersTmp = taskCalled()

    await this.browser.setBrowser()
    await this.login.login()
   
    for (const unit of foldersTmp) {
      const unitStandard = standardizationUnits[unit.toLowerCase()]
      if (!unitStandard) {
        this.browser.browserClose()
        console.log(`❌ Unidade "${unit}" não encontrada no arquivo de padronização!`)
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
        broadcastWss2('Chamado tramitado com sucesso' + unit)
      } catch (error: any) {
        broadcastWss2(`❌ Erro ao processar unidade "${unit}": ` + error.message || error)
        throw new AppError(`Falha no processamento da unidade ${unit}`, 500)
      }
    }

    await this.browser.browserClose()
    broadcastWss2("🎉 Processamento de chamados concluído!")
  }
}