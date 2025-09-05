import { ElementHandle, Page } from 'puppeteer'
import { GlpiBrowser } from "./glpi-browser"

export class GlpiCalleds {
  constructor(private browser: GlpiBrowser) {}

  async calledSearch (idCalled: string) {
    const page = this.browser.getPage()

    await page.goto(
      `https://glpi.ints.org.br/front/ticket.form.php?id=${idCalled}`, 
      { timeout: 35000 }
    )

    // aguadar Processando chamado 
    await page.waitForFunction(() => {
      return document.querySelector<any>('[id^="ui-id-5"]').href
    })
    
    // Processando chamado 
    await page.click('[id^="ui-id-5"]') 
  }

  async taskCalled (textLogs: string) {
    const page = this.browser.getPage()

    await page.waitForSelector('li.task', { visible: true })
    await page.click('li.task') 
    
    // Espera o iframe aparecer
    await page.waitForSelector('iframe[id^="content"]');

    // Pega o iframe elementHandle
    const iframeElement: ElementHandle<any> | null = await page.$('iframe[id^="content"]')

    // Acessa o conteúdo do iframe como um frame separado
    const frame = await iframeElement?.contentFrame()

    // Digita no <p> dentro do iframe
    await frame?.evaluate((value) => {
      const p = document.querySelector('p')
      if (p) {
        p.textContent = value
      }
    }, textLogs)

    // espera o iframe reaparecer
    await page.waitForSelector('iframe[id^="content"]', { visible: true });
 
    await page.click('.x-button')
  }

  async closeCalled () {
    const page = this.browser.getPage()

    await page.waitForSelector('.solution', { visible: true })
    await page.click('.solution') 

    await page.waitForFunction(() => {
      return document.querySelector<any>('select[id^="dropdown_solutiontemplates"]')
    })
    
    await page.evaluate(() => {
      // Modelo de solução
      document.querySelector('select[id^="dropdown_solutiontemplates"]')!.innerHTML = 
        '<option value="21" selected="selected">Atendimento conclúido</option>'

      // Tipo da solução
      document.querySelector('select[id^="dropdown_solutiontypes"]')!.innerHTML = 
        '<option value="3" selected="selected">Acesso Remoto</option>'
    })

    const word = this.browser.credentials.user.split('.')[0]
    const credentialsUser = word[0].toUpperCase().concat(word.substring(1))

    // Descrição
    await page.waitForSelector('iframe[id^="content"]');
    const iframeElement: ElementHandle<any> | null = await page.$('iframe[id^="content"]')
    const frame = await iframeElement?.contentFrame()
    await frame?.evaluate((value) => {
      const p = document.querySelector('p')
      if (p) {
        p.innerHTML= `<p><b>Atendimento realizado o mesmo foi validado por: ${value}</b></p>`
      }
    }, credentialsUser)

    // Espera o iframe aparecer
    await page.waitForSelector('iframe[id^="content"]');

    // Adicionar botão
    await page.click('.submit')

    await this.solutionApproval(page)
  }

  private async solutionApproval (page: Page) {

    // Aprovar satisfação
    await page.waitForFunction(() => {
      return document.querySelector<any>('.submit')[1]
    })

    await page.evaluate(() => {
      document.querySelectorAll<HTMLSelectElement>(".submit")[1].click()
    })
  }
}