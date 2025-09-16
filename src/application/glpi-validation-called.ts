import { env } from "@/config/env"
import { GlpiBrowser } from "./glpi-browser"
import { broadcastWss2 } from "@/utils/broadcast-ws"
import { dayOfWeek, incrementDay, taskCalled, uniqueUnitsToHtml, validationCalledExists } from "@/services/glpi-task-called.services"
import { DateType } from "@/schemas/log-analysis.schema"

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
 * Verifica se existem chamados no GLPI dentro de um intervalo de datas.
 *
 * Fluxo da função:
 * 1. Calcula a quantidade de dias entre `dateStart` e `dateEnd` usando `dayOfWeek`.
 * 2. Para cada dia do intervalo:
 *    - Navega até a página de tickets do GLPI com filtro pelo nome "Verificar backup FTP Servidor".
 *    - Tenta localizar a tabela de resultados; se não existir, retorna arquivos temporários via `taskCalled`.
 *    - Extrai IDs e nomes de unidades da tabela, filtrando valores nulos.
 * 3. Remove duplicados e formata as unidades com `uniqueUnitsToHtml`.
 * 4. Exibe os resultados via `broadcastWss2`.
 * 5. Valida arquivos restantes com `validationCalledExists`.
 *
 * @param {DateType} params - Objeto com as datas de início e fim do intervalo.
 * @param {string} params.dateStart - Data inicial no formato YYYY-MM-DD.
 * @param {string} params.dateEnd - Data final no formato YYYY-MM-DD.
 * @returns {Promise<string[] | false>} Lista de unidades encontradas ou `false` se não houver arquivos restantes.
 * @throws {Error} Caso ocorra falha de navegação, acesso à página ou processamento.
 */

  public async existsCalledSpecificDate ({ dateStart, dateEnd }: DateType): Promise<false | string[]> {
    const page = this.browser.getPage()
    let arrayCalledsExists: string[] = []

    const week = dayOfWeek({ dateStart, dateEnd })

    for (let i: number = 0; i <= week; i++) { 
      const day = incrementDay({ day: i, dateStart })

      await page.goto(
        `${env.URLGLPI}/front/ticket.php?is_deleted=0&as_map=0&criteria%5B0%5D%5Blink%5D=AND&criteria%5B0%5D%5Bfield%5D=1&criteria%5B0%5D%5Bsearchtype%5D=contains&criteria%5B0%5D%5Bvalue%5D=Verificar+backup+FTP+Servidor&criteria%5B1%5D%5Blink%5D=AND&criteria%5B1%5D%5Bfield%5D=26&criteria%5B1%5D%5Bsearchtype%5D=contains&criteria%5B1%5D%5Bvalue%5D=${day}&search=Pesquisar&itemtype=Ticket&start=0&_glpi_csrf_token=dbc412b9344737f5284d1b57805bf130`, 
        { timeout: 35000 }
      )

      // Tenta localizar tabela
      const hasTable = await page.$("table.tab_cadrehov > tbody > tr > td")
      if (!hasTable) {
        continue
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
      
      const idCalledExists = result.filter(value => value !== null)
      idCalledExists.length !== 0 && arrayCalledsExists.push(...idCalledExists as string[])
    }

    if(arrayCalledsExists.length === 0) return taskCalled()

    const formattedUnits = uniqueUnitsToHtml(arrayCalledsExists)
    broadcastWss2(`
      <p>Chamados já existe nessa data:</p
      <p style="color: #f8fafc">${formattedUnits.join("")}</p>
    `.trim())

    const resultValidation = await validationCalledExists(formattedUnits as string[])
    if (!resultValidation) {
      broadcastWss2('Não tem arquivo para ser enviado!')
      return false
    }

    arrayCalledsExists.length = 0
    return resultValidation
  }
}