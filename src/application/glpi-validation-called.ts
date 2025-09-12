import { env } from "@/config/env"
import { GlpiBrowser } from "./glpi-browser"

/**
 * Serviço responsável por validar se já existe um chamado
 * em uma data específica dentro do GLPI.
 */

export class GlpiValidationCalled {

  /**
   * @param {GlpiBrowser} browser - Instância do navegador Puppeteer encapsulado.
   */
  
  constructor (private browser: GlpiBrowser) {}

  /**
   * Verifica se existe um chamado em uma data específica no GLPI.
   * @param {string} date - Data a ser verificada (formato esperado pelo GLPI).
   * @returns {Promise<string[] | false>} Lista de IDs de chamados encontrados ou `false` se nenhum.
   * @throws {Error} Se ocorrer falha na navegação ou execução da página.
   */

  public async existsCalledSpecificDate (date: string) {
    const page = this.browser.getPage()

    await page.goto(
      `${env.URLGLPI}/front/ticket.php?is_deleted=0&as_map=0&criteria%5B0%5D%5Blink%5D=AND&criteria%5B0%5D%5Bfield%5D=1&criteria%5B0%5D%5Bsearchtype%5D=contains&criteria%5B0%5D%5Bvalue%5D=Verificar+backup+FTP+Servidor&criteria%5B1%5D%5Blink%5D=AND&criteria%5B1%5D%5Bfield%5D=26&criteria%5B1%5D%5Bsearchtype%5D=contains&criteria%5B1%5D%5Bvalue%5D=${date}&search=Pesquisar&itemtype=Ticket&start=0&_glpi_csrf_token=dbc412b9344737f5284d1b57805bf130`, 
      { timeout: 35000 }
    )

    // Tenta localizar tabela
    const hasTable = await page.$("table.tab_cadrehov > tbody > tr > td")
    if (!hasTable) {
      return false
    } 

    await page.waitForSelector("table.tab_cadrehov > tbody > tr > td", { visible: true })

    // Procura na data especifica se já existe chamado
    const result = await page.evaluate(() => {
      return [...document.querySelectorAll("table.tab_cadrehov > tbody > tr > td")]
        .map(value => {
          if (value.textContent.match(/\d{3}\s\d{3}/g)) 
            return value.textContent.replace(/\s+/g, "") + '<br>' // remove espaço
          
          if (value.textContent.includes('INTS > REGIAO SACA >')) 
            return value.textContent.replace("INTS > REGIAO SACA > ", "") + "<br><br>"
      })
    })

    const idCalledExists = result.filter(value => value !== null)
    return idCalledExists
  }
}