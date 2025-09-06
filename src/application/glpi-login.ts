import { AppError } from "@/utils/AppError"
import { GlpiBrowser } from "./glpi-browser"

/**
 * Responsável pelo processo de autenticação no GLPI.
 */

export class GlpiLogin {
  /**
   * Inicializa a classe de login com o navegador GLPI.
   * @param browser Instância do navegador controlado via Puppeteer.
   */

  constructor (private browser: GlpiBrowser) {}

   /**
   * Realiza o login no GLPI:
   *  - Acessa a URL principal.
   *  - Preenche usuário, senha e domínio.
   *  - Submete o formulário.
   *  - Aguarda carregamento dos elementos principais da aplicação.
   * 
   * @throws {AppError} Se não conseguir autenticar ou carregar o sistema.
   */

  public async login(){
    const page = this.browser.getPage()

    await page.goto("https://glpi.ints.org.br/", { timeout: 35000 })
    await page.type("#login_name", this.browser.credentials.user)
    await page.type("#login_password", this.browser.credentials.password)
    await page.type("#dropdown_auth1", "DC-SACA")
    await page.click(`[type="submit"]`)

    await page.waitForSelector("#c_logo", { timeout: 10000 })
    .catch(async () => {
      const error = await page.evaluate(() => {
        return document.querySelector('[class="center b"]')?.textContent
      })
  
      return this.loginError (error)
    })

    //@ts-ignore
    await page.waitForSelector('.loadingindicator', { state: 'hidden', timeout: 10000 })
    .catch (() => {
      throw new AppError("Não foi possível carregar o seletor de unidades")
    })
  }

   /**
   * Trata mensagens de erro de login.
   * Fecha o navegador e lança erro com detalhes.
   * 
   * @param error Mensagem de erro retornada pelo GLPI.
   * @throws {AppError} Sempre lança erro com status apropriado.
   */

  private async loginError (error: string | undefined) {
    if(error){
      await this.browser.browserClose()
      throw new AppError(error + " no GLPI.", 401)
    }

    await this.browser.browserClose()
    throw new AppError("Elemento de entidade não carregou após login no Glpi.", 500) 
  }
}