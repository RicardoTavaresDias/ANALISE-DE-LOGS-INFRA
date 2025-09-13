import { env } from "@/config/env"
import { GlpiBrowser } from "./glpi-browser"
import { broadcastWss2 } from "@/utils/broadcast-ws"
import { taskCalled, validationCalledExists } from "@/services/glpi-task-called.services"

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
 * Verifica se existem chamados no GLPI em uma data específica.
 *
 * - Navega até a página de tickets do GLPI filtrando pelo nome "Verificar backup FTP Servidor" e pela data informada.
 * - Tenta localizar a tabela de resultados:
 *    - Se a tabela não existir, chama `taskCalled()` e retorna seu resultado.
 *    - Se a tabela existir, aguarda os elementos ficarem visíveis.
 * - Extrai os IDs de chamados e nomes de unidades da tabela, formatando o texto (removendo espaços e prefixos).
 * - Exibe via `broadcastWss2` os chamados encontrados na data.
 * - Valida os chamados existentes chamando `validationCalledExists`:
 *    - Remove pastas temporárias de unidades já processadas.
 *    - Retorna `false` caso não haja arquivos/pastas restantes.
 *
 * @param {string} date - Data a ser verificada (formato aceito pelo GLPI).
 * @returns {Promise<string[] | false>} IDs das unidades com chamados existentes ou `false` se nenhum chamado ou arquivos restantes.
 * @throws {Error} Se ocorrer falha na navegação, execução do Puppeteer ou na manipulação da página.
 */

  public async existsCalledSpecificDate (date: string): Promise<false | string[]> {
    const page = this.browser.getPage()

    await page.goto(
      `${env.URLGLPI}/front/ticket.php?is_deleted=0&as_map=0&criteria%5B0%5D%5Blink%5D=AND&criteria%5B0%5D%5Bfield%5D=1&criteria%5B0%5D%5Bsearchtype%5D=contains&criteria%5B0%5D%5Bvalue%5D=Verificar+backup+FTP+Servidor&criteria%5B1%5D%5Blink%5D=AND&criteria%5B1%5D%5Bfield%5D=26&criteria%5B1%5D%5Bsearchtype%5D=contains&criteria%5B1%5D%5Bvalue%5D=${date}&search=Pesquisar&itemtype=Ticket&start=0&_glpi_csrf_token=dbc412b9344737f5284d1b57805bf130`, 
      { timeout: 35000 }
    )

    // Tenta localizar tabela
    const hasTable = await page.$("table.tab_cadrehov > tbody > tr > td")
    if (!hasTable) {
      const foldersTmp = taskCalled()
      return foldersTmp
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
    broadcastWss2(`
      <p>Chamados já existe nessa data:</p>
      <p style="color: #f8fafc">${idCalledExists.join("")}</p>
    `.trim())

    const resultValidation = await validationCalledExists(idCalledExists as string[])
    if (!resultValidation) {
      broadcastWss2('Não tem arquivo para ser enviado!')
      return false
    }

    return resultValidation
  }
}