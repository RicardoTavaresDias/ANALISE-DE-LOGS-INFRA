import puppeteer, { Browser, Page } from "puppeteer"
import { Credentials } from "./interface/ICredentials"
import { env } from "@/config/env"

/**
 * Classe responsável pelo gerenciamento do navegador Puppeteer
 * dentro do fluxo GLPI.
 * 
 * Fornece abstrações para abrir, acessar páginas e encerrar a sessão.
 */

export class GlpiBrowser {
  public credentials: Credentials
  private page!: Page
  private browser!: Browser

   /**
   * Inicializa o navegador GLPI com credenciais.
   * @param login Credenciais do usuário para autenticação.
   */

  constructor(login: Credentials){
    this.credentials = login
  }

   /**
   * Abre uma nova instância do navegador e cria uma página.
   * O navegador é aberto em modo não-headless.
   */

  public async setBrowser(){
    this.browser = await puppeteer.launch({ headless: env.HEADLESS })
    const page = await this.browser.newPage()
    this.page = page
  }

   /**
   * Retorna a página ativa do navegador.
   * 
   * @returns {Page} Página atual controlada pelo Puppeteer.
   */

  public getPage(): Page {
    return this.page
  }

  /**
   * Fecha o navegador Puppeteer.
   */

  public async browserClose(){
    await this.browser.close()
  }
}