import { GlpiBrowser } from "./glpi-browser"
import { GlpiCalleds } from "./glpi-calleds"
import { GlpiLogin } from "./glpi-login"
import { Credentials } from "./interface/ICredentials"

export class GlpiFacade {
  private browser: GlpiBrowser
  private login: GlpiLogin
  private calleds: GlpiCalleds

  constructor (credentials: Credentials) {
    this.browser = new GlpiBrowser(credentials)
    this.login = new GlpiLogin(this.browser)
    this.calleds = new GlpiCalleds(this.browser)
  }

  async processCalleds() {
    await this.browser.setBrowser()
    await this.login.login()
    await this.calleds.called()

    //await this.calleds.closeCalled()
    //await this.browser.browserClose()
  }
}