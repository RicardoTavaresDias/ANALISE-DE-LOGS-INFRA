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
   * Verifica se já existem chamados abertos no GLPI para uma data específica.
   *
   * ### Fluxo da função:
   * 1. Navega até a página de tickets do GLPI aplicando filtros:
   *    - Nome do chamado: **"Verificar backup FTP Servidor"**
   *    - Data específica recebida no parâmetro.
   * 2. Verifica se existe tabela de resultados:
   *    - Caso não exista, retorna um array vazio `[]`.
   *    - Caso exista, coleta os valores das células da tabela.
   * 3. Extrai:
   *    - **IDs de chamados** (quando no formato `000 000`, ex.: `228698`).
   *    - **Nomes de unidades** (quando contêm `INTS > REGIAO SACA > ...`).
   * 4. Remove valores `null` ou `undefined` e retorna lista limpa.
   *
   * @param {string} day - Data a ser pesquisada (formato `YYYY-MM-DD`).
   * @returns {Promise<string[]>} Lista de IDs de chamados e/ou nomes de unidades.
   *   Retorna `[]` se nenhum chamado for encontrado.
   * @throws {Error} Caso ocorra falha de navegação, timeout ou erro ao acessar a página.
   */

  public async existsCalledSpecificDate (day: string): Promise <string[] | []> {
    const page = this.browser.getPage()

    await page.waitForSelector("#spansearchtypecriteriaTicket1", { visible: true })
    await page.evaluate((value) => {
      document.querySelector<HTMLSelectElement>("#spansearchtypecriteriaTicket1 > input")!.value = ""
      document.querySelector<HTMLSelectElement>("#spansearchtypecriteriaTicket1 > input")!. value = value
      document.querySelector<HTMLSelectElement>(".search_actions > .submit")!.click()
    }, day)

    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 })

    // Tenta localizar tabela
    const hasTable = await page.$("table.tab_cadrehov > tbody > tr > td")
    if (!hasTable) {
      return []
    } 

    await page.waitForSelector("table.tab_cadrehov > tbody > tr > td", { visible: true })

    // Procura na data especifica se já existe chamado
    const result = await page.evaluate(() => {
      return [...document.querySelectorAll("table.tab_cadrehov > tbody > tr > td")]
        .map(value => {
          if (value.textContent.match(/\d{3}\s\d{3}/g)) 
            return value.textContent.replace(/\s+/g, "")
          
          if (value.textContent.includes('INTS > REGIAO SACA >')) 
            return value.textContent.replace("INTS > REGIAO SACA > ", "")
      })
    })
    
    const idCalledExists = result.filter(value => value !== null && value !== undefined)
    return idCalledExists
  }

/**
 * Busca chamados no GLPI aplicando filtros pré-definidos via URL.
 *
 * @async
 * @returns {Promise<void>} Resolvido após o carregamento da página de resultados.
 */

  public async searchCalledsValidation () {
    const page = this.browser.getPage()

    await page.goto(
      `${env.URLGLPI}/front/ticket.php?is_deleted=0&as_map=0&criteria%5B0%5D%5Blink%5D=AND&criteria%5B0%5D%5Bfield%5D=1&criteria%5B0%5D%5Bsearchtype%5D=contains&criteria%5B0%5D%5Bvalue%5D=Verificar+backup+FTP+Servidor&criteria%5B1%5D%5Blink%5D=AND&criteria%5B1%5D%5Bfield%5D=26&criteria%5B1%5D%5Bsearchtype%5D=contains&criteria%5B1%5D%5Bvalue%5D=&search=Pesquisar&itemtype=Ticket&start=0&_glpi_csrf_token=dbc412b9344737f5284d1b57805bf130`, 
      { timeout: 35000 }
    )

    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 })
  }
}