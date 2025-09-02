import { GlpiLogin } from "./glpi-login"
import { ElementHandle } from 'puppeteer'
import fs from "node:fs"

export class GlpiCalleds extends GlpiLogin {
  async called () {
    await this.page.goto(
      "https://glpi.ints.org.br/front/ticket.php?is_deleted=0&as_map=0&criteria%5B0%5D%5Blink%5D=AND&criteria%5B0%5D%5Bfield%5D=1&criteria%5B0%5D%5Bsearchtype%5D=contains&criteria%5B0%5D%5Bvalue%5D=Verificar+backup+FTP&criteria%5B1%5D%5Blink%5D=AND&criteria%5B1%5D%5Bfield%5D=12&criteria%5B1%5D%5Bsearchtype%5D=equals&criteria%5B1%5D%5Bvalue%5D=notold&criteria%5B2%5D%5Blink%5D=AND&criteria%5B2%5D%5Bfield%5D=80&criteria%5B2%5D%5Bsearchtype%5D=contains&criteria%5B2%5D%5Bvalue%5D=paulista&search=Pesquisar&itemtype=Ticket&start=0&_glpi_csrf_token=6ffd6387a18ef61ed6e16bcfc944ee1b", 
      { timeout: 35000 }
    )

    const urlIdCalled = await this.page.evaluate(() => {
      //@ts-ignore
      return [...document.querySelectorAll('[id^="Ticket"]')][0].href
    })
    
    await this.page.goto(urlIdCalled, { timeout: 35000 })

     await this.page.evaluate(() => {
      //@ts-ignore
      document.querySelectorAll('.ui-tabs-nav li a')[1].click() //Processando chamado
    })

    this.taskCalled()
  }

  private async taskCalled () {
    await this.page.waitForSelector('li.task', { visible: true })
    await this.page.click('li.task') 
    
    // Espera o iframe aparecer
    await this.page.waitForSelector('iframe[id^="content"]');

    // Pega o iframe elementHandle
    const iframeElement: ElementHandle<any> | null = await this.page.$('iframe[id^="content"]')

    // Acessa o conteúdo do iframe como um frame separado
    const frame = await iframeElement?.contentFrame()

    // teste
    const content = await fs.promises.readFile(`./tmp/pantanal_error.txt`, "utf-8")

    // Digita no <p> dentro do iframe
    await frame?.evaluate((value) => {
      //@ts-ignore
      const p = document.querySelector('p')
      if (p) {
        p.textContent = value
      }
    }, content)

    await this.page.click('.x-button')
  }

  async closeCalled () {
    await this.page.click('li.solution') 
  }
}