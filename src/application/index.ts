import { GlpiBrowser } from "./glpi-browser"
import { GlpiCalleds } from "./glpi-calleds"
import { GlpiLogin } from "./glpi-login"
import { GlpiCreateCalled } from "./glpi-create-called"
import { Credentials } from "./interface/ICredentials"
import { taskCalled, readTaskCalled, removeFolderUnit } from "@/services/glpi-task-called.services"
import standardizationUnits from "@/lib/standardization-units"
import { AppError } from "@/utils/AppError"

export class GlpiFacade {
  private browser: GlpiBrowser
  private login: GlpiLogin
  private calleds: GlpiCalleds
  private createCalled: GlpiCreateCalled

  constructor (credentials: Credentials) {
    this.browser = new GlpiBrowser(credentials)
    this.login = new GlpiLogin(this.browser)
    this.calleds = new GlpiCalleds(this.browser)
    this.createCalled = new GlpiCreateCalled(this.browser)
  }

  async processCalleds() {
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
        console.log("removeFolderUnit", unit)
        removeFolderUnit(unit)
      } catch (error: any) {
        console.error(`❌ Erro ao processar unidade "${unit}":`, error.message || error)
        throw new AppError(`Falha no processamento da unidade ${unit}`, 500)
      }
    }

    await this.browser.browserClose()
    console.log("🎉 Processamento de chamados concluído!")
  }
}