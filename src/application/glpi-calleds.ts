import { ElementHandle, Page } from 'puppeteer'
import { GlpiBrowser } from "./glpi-browser"

/**
 * Responsável por gerenciar chamados já existentes no GLPI:
 *  - Abrir chamado por ID
 *  - Registrar tarefas
 *  - Encerrar chamado
 */

export class GlpiCalleds {
   /**
   * Inicializa a classe de chamados com o navegador.
   * @param browser Instância do navegador controlado via Puppeteer.
   */

  constructor(private browser: GlpiBrowser) {}

  /**
   * Abre um chamado específico pelo ID.
   * Navega até a tela do chamado e garante que a aba de tarefas esteja disponível.
   * 
   * @param idCalled ID do chamado no GLPI.
   * @throws {Error} Se o chamado ou a aba de tarefas não carregar.
   */

  public async calledSearch (idCalled: string) {
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

  /**
   * Insere uma tarefa no chamado.
   * Escreve o log dentro do editor de texto (iframe) e confirma.
   * 
   * @param textLogs Texto dos logs a serem inseridos na tarefa.
   * @throws {Error} Se a aba de tarefas ou o iframe não carregar.
   */

  public async taskCalled (textLogs: string) {
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

  /**
   * Fecha o chamado como concluído.
   * Preenche modelo e tipo de solução, insere descrição no iframe
   * e envia para aprovação.
   * 
   * @throws {Error} Se os campos obrigatórios não forem carregados.
   */

  public async closeCalled () {
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

   /**
   * Confirma a solução do chamado aprovando satisfação.
   * 
   * @param page Instância da página atual.
   * @throws {Error} Se a tela de aprovação não carregar.
   */

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