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

    // aguardar aba de processamento
    await page.waitForFunction(() => {
      return !!document.querySelector('[id^="ui-id-5"]')
    }, { timeout: 15000 })
    
    // Processando chamado 
    await page.click('[id^="ui-id-5"]') 

    // garantir que a aba de tarefas vai aparecer
    await page.waitForFunction(() => {
      return !!document.querySelector('li.task')
    }, { timeout: 15000 })
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

    // aguardar que o botão X esteja pronto
    await page.waitForFunction(() => {
      return !!document.querySelector('.x-button')
    }, { timeout: 10000 })
 
    await page.click('.x-button')

    // Esperar que a aba solution esteja disponível antes de chamar closeCalled
    await page.waitForFunction(() => {
      return !!document.querySelector('li.solution')
    }, { timeout: 15000 })
  }

  async closeCalled () {
    const page = this.browser.getPage()

    await page.waitForSelector('li.solution', { visible: true })
    await page.click('li.solution') 

    // esperar selects carregarem
    await page.waitForFunction(() => {
      return !!document.querySelector('select[id^="dropdown_solutiontemplates"]')
    }, { timeout: 15000 })
    
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

    // Descrição no iframe
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
      return document.querySelectorAll('.submit')[1]
    })

    await page.evaluate(() => {
      document.querySelectorAll<HTMLSelectElement>(".submit")[1].click()
    })

    // esperar selects carregarem
    await page.waitForFunction(() => {
      return !!document.querySelector(".rich_text_container")
    }, { timeout: 15000 })
  }
}