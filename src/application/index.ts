import { GlpiBrowser } from "./glpi-browser"
import { GlpiCalleds } from "./glpi-calleds"
import { GlpiLogin } from "./glpi-login"
import { GlpiCreateCalled } from "./glpi-create-called"
import { Credentials } from "./interface/ICredentials"
import { taskCalled } from "@/services/glpi-task-called.services"
import standardizationUnits from "@/lib/standardization-units"

import fs from "node:fs"

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
    console.log(foldersTmp)

    //await this.browser.setBrowser()
    //await this.login.login()

    if (!standardizationUnits['pantanal'.toLowerCase()]) {
      this.browser.browserClose()
      return console.log(`Arquivo Guacuri não encontrado, nome ou arquivo não existe!`)
    }
    
    //await this.createCalled.treeUnits(standardizationUnits['pantanal'.toLowerCase()].name)
    //const resultIdCalled = await this.createCalled.newCalled(standardizationUnits['pantanal'.toLowerCase()]) // funcionando

    // ##########
      // for (const unit of teste) {
      //   await this.createCalled.treeUnits(standardizationUnits[unit.toLowerCase()].name)
      //   await this.createCalled.newCalled(standardizationUnits[unit.toLowerCase()])
      // }
    // ##########

    
    //await this.calleds.calledSearch('226623')

    // ############ Apenas Teste
      const contentSucess = await fs.promises.readFile(`./tmp/pantanal_success.txt`, "utf-8")
      const contentError = await fs.promises.readFile(`./tmp/pantanal_error.txt`, "utf-8")

      const text = contentError.length === 0 ? contentSucess : contentSucess + contentError
      //await this.calleds.taskCalled(text)

      console.log(contentError.length === 0)
      console.log(text)

      if(contentError.length === 0) {
        //await this.calleds.closeCalled()
      } 

      //await this.browser.browserClose()
    // ############

    //await this.calleds.taskCalled(content)
    //await this.calleds.closeCalled()
    //await this.browser.browserClose()
  }
}