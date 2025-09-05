import { GlpiBrowser } from "./glpi-browser"
import { GlpiCalleds } from "./glpi-calleds"
import { GlpiLogin } from "./glpi-login"
import { GlpiCreateCalled } from "./glpi-create-called"
import { Credentials } from "./interface/ICredentials"
import { taskCalled, readTaskCalled, removeFolderUnit } from "@/services/glpi-task-called.services"
import standardizationUnits from "@/lib/standardization-units"

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
      if (!standardizationUnits[unit.toLowerCase()]) {
        this.browser.browserClose()
        return console.log(`Arquivo Guacuri não encontrado, nome ou arquivo não existe!`)
      }

      await this.createCalled.treeUnits(standardizationUnits[unit.toLowerCase()].name)
      const IdCalledCreate = await this.createCalled.newCalled(standardizationUnits[unit.toLowerCase()])

      await this.calleds.calledSearch(IdCalledCreate)

      const responseUnits = await readTaskCalled(unit)
      if(responseUnits.isError){
        await this.calleds.taskCalled(responseUnits.logs)
        
        console.log("erro vazio e fecha chamado")
        await this.calleds.closeCalled()
      } else {
        await this.calleds.taskCalled(responseUnits.logs)
      }

      removeFolderUnit(unit)
    }

    await this.browser.browserClose()
  }
}