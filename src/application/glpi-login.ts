import { AppError } from "@/utils/AppError"
import { GlpiBrowser } from "./glpi-browser"

export class GlpiLogin extends GlpiBrowser {
  async login(){
    await this.setBrowser()
    await this.page.goto("https://glpi.ints.org.br/", { timeout: 35000 })
    await this.page.type("#login_name", this.user.user)
    await this.page.type("#login_password", this.user.password)
    await this.page.type("#dropdown_auth1", "DC-SACA")
    await this.page.click(`[type="submit"]`)

    await this.page.waitForSelector("#c_logo", { timeout: 10000 })
    .catch(async () => {
      const loginError = await this.page.evaluate(() => {
        // @ts-ignore
        return document.querySelector('[class="center b"]')?.textContent
      })
  
      if(loginError){
        this.browserClose()
        throw new AppError(loginError + " no GLPI.", 401)
      }

      this.browserClose()
      throw new AppError("Elemento de entidade não carregou após login no Glpi.", 500) 
    })
  }
}