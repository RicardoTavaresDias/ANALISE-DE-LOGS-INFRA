import { ElementHandle } from 'puppeteer'
import fs from "node:fs"
import { GlpiBrowser } from "./glpi-browser"

export class GlpiCalleds {
  constructor(private browser: GlpiBrowser) {}

  async calledSearch () {
    const page = this.browser.getPage()

    await page.goto(
      "https://glpi.ints.org.br/front/ticket.php?is_deleted=0&as_map=0&criteria%5B0%5D%5Blink%5D=AND&criteria%5B0%5D%5Bfield%5D=1&criteria%5B0%5D%5Bsearchtype%5D=contains&criteria%5B0%5D%5Bvalue%5D=Verificar+backup+FTP&criteria%5B1%5D%5Blink%5D=AND&criteria%5B1%5D%5Bfield%5D=12&criteria%5B1%5D%5Bsearchtype%5D=equals&criteria%5B1%5D%5Bvalue%5D=notold&criteria%5B2%5D%5Blink%5D=AND&criteria%5B2%5D%5Bfield%5D=80&criteria%5B2%5D%5Bsearchtype%5D=contains&criteria%5B2%5D%5Bvalue%5D=paulista&search=Pesquisar&itemtype=Ticket&start=0&_glpi_csrf_token=6ffd6387a18ef61ed6e16bcfc944ee1b", 
      { timeout: 35000 }
    )
    /*
      ## Busca por Id do chamado ex: 226358

      https://glpi.ints.org.br/front/ticket.php?is_deleted=0&as_map=0&criteria%5B0%5D%5Blink%5D=AND&criteria%5B0%5D%5Bfield%5D=2&criteria%5B0%5D%5Bsearchtype%5D=contains&criteria%5B0%5D%5Bvalue%5D=226358&search=Pesquisar&itemtype=Ticket&start=0&_glpi_csrf_token=3790eaaed58bd70c45a1c4e4550dcc05
    */

    const urlIdCalled = await page.evaluate(() => {
      return [...document.querySelectorAll<any>('[id^="Ticket"]')][0].href
    })
    
    await page.goto(urlIdCalled, { timeout: 35000 })

     await page.evaluate(() => {
      document.querySelectorAll<HTMLSelectElement>('.ui-tabs-nav li a')[1].click() //Processando chamado
    })

    this.taskCalled()
  }

  private async taskCalled () {
    const page = this.browser.getPage()

    await page.waitForSelector('li.task', { visible: true })
    await page.click('li.task') 
    
    // Espera o iframe aparecer
    await page.waitForSelector('iframe[id^="content"]');

    // Pega o iframe elementHandle
    const iframeElement: ElementHandle<any> | null = await page.$('iframe[id^="content"]')

    // Acessa o conteúdo do iframe como um frame separado
    const frame = await iframeElement?.contentFrame()

    // ############ Apenas Teste
    const content = await fs.promises.readFile(`./tmp/pantanal_error.txt`, "utf-8")

    // Digita no <p> dentro do iframe
    await frame?.evaluate((value) => {
      const p = document.querySelector('p')
      if (p) {
        p.textContent = value
      }
    }, content)

    // ############

    await page.click('.x-button')
  }

  async closeCalled () {
    const page = this.browser.getPage()

    await page.click('li.solution') 
  }
}