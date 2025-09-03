import { GlpiBrowser } from "./glpi-browser"
import { GlpiCalleds } from "./glpi-calleds"
import { GlpiLogin } from "./glpi-login"
import { GlpiCreateCalled } from "./glpi-create-called"
import { Credentials } from "./interface/ICredentials"
import { taskCalled } from "@/services/glpi-task-called.services"

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
    await this.browser.setBrowser()
    await this.login.login()
    

    // ##########
    const teste = taskCalled()

    for (const unit of teste) {
      await this.createCalled.treeUnits(standardizationUnits[unit])
    }
    // ##########

    
   // await this.calleds.called()

    //await this.calleds.closeCalled()
    //await this.browser.browserClose()
  }
}