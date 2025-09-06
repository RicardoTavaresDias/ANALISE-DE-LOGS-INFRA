import { GlpiBrowser } from "./glpi-browser"
import { ElementHandle, Page } from "puppeteer"
import type { IStandardizationUnits } from "@/lib/standardization-units"

/**
 * Responsável pela criação de chamados no GLPI.
 * Contém os passos necessários para selecionar unidade,
 * preencher formulário e registrar novo chamado.
 */

export class GlpiCreateCalled {
  /**
 * Responsável pela criação de chamados no GLPI.
 * Contém os passos necessários para selecionar unidade,
 * preencher formulário e registrar novo chamado.
 */

  constructor (private browser: GlpiBrowser) {}

  /**
   * Seleciona a unidade (entidade) na árvore de unidades do GLPI.
   * 
   * @param unitName Nome da unidade padronizada.
   * @throws {Error} Se a unidade não for encontrada na árvore.
   */

  public async treeUnits (unitName: IStandardizationUnits["name"]) {
    const page = this.browser.getPage()

    // Seleciona a arvore das unidades REGIAO SACA
    await page.evaluate(() => {
      document.querySelector<HTMLSelectElement>("#global_entity_select")!.click()
    })

    await page.waitForSelector(".jstree-closed", { timeout: 10000 })
    await page.click(".jstree-icon")

    await page.waitForFunction((unitValue) => {
      return [...document.querySelectorAll(".jstree-anchor")]
      .some(el => el.textContent?.includes(unitValue));
    }, { timeout: 10000 }, unitName)

    await page.evaluate((unitValue) => {
      const node = [...document.querySelectorAll<HTMLSelectElement>(".jstree-children .jstree-anchor")].find(value => value.textContent.includes(unitValue))
      node?.click()
    }, unitName)
  }

   /**
   * Cria um novo chamado no GLPI para a unidade informada.
   * 
   * @param units Objeto da unidade padronizada.
   * @returns {Promise<string>} ID ou mensagem de sucesso do chamado criado.
   */

  public async newCalled (units: IStandardizationUnits) {
    const page = this.browser.getPage()

    await page.goto("https://glpi.ints.org.br/front/ticket.form.php", { timeout: 35000, waitUntil: 'networkidle0' })

    await this.fillTypeField(page)
    await this.selectCategory(page)
    await this.setGroups(page, units)
    await this.fillTitle(page)
    await this.fillDescription(page)

    await page.click('.submit')

    // Aguardar menssagem de sucesso
    await this.waitForFunction(page, '[id^="message_after_redirect"]')

    const message = await page.evaluate(() => {
      return document.querySelector<HTMLSelectElement>('[id^="message_after_redirect"] a')!.innerText
    })

    console.log('Chamado criado ' + message)
    return message
  }

  /**
   * Preenche o campo "Tipo" do chamado.
   */

  private async fillTypeField (page: Page) {
    // Aguardar o campo tipo
    await this.waitForFunction(page, '[id^="dropdown_type"]')

    // Tipo - Requisição
    await page.evaluate(() => {
      document.querySelector<HTMLSelectElement>('[id^="dropdown_type"]')!.value = "2"
      document.querySelector<any>('[id^="dropdown_type"]').onchange()
    })

    // Aguardar o campo tipo
    await this.waitForFunction(page, '[id^="dropdown_type"]')
  }

  /**
   * Seleciona a categoria do chamado.
   */

  private async selectCategory (page: Page) {
    //Categoria - BACKUP > Acompanhamento Diario Rotina de Backup 
    await page.evaluate(() => {
      const category = document.querySelector<HTMLSelectElement>('select[id^="dropdown_itilcategories"]')
      if (category) {
          category.innerHTML = '<option value="1030">BACKUP > Acompanhamento Diario Rotina de Backup</option>'
          category.value = '1030'
          $(category).trigger('change') // realizando mudança no select2 Ajax
      }
    })

    // Aguardar o campo Categoria
    await this.waitForFunction(page, 'select[id^="dropdown_itilcategories"]')
  }

  /**
   * Define grupos relacionados ao chamado:
   *  - Requerente
   *  - Observador
   *  - Atribuído para
   * 
   * @param page Página atual do navegador.
   * @param units Unidade padronizada usada nos grupos.
   */

  private async setGroups (page: Page, units: IStandardizationUnits) {
     await page.evaluate((value) => {
      //Requerente (user)
      document.querySelector('[id^="dropdown__users_id_requester"]')!.innerHTML = 
        '<option value="0" selected="selected">-----</option>'

      //Atribuído para (user) ??
      document.querySelectorAll<HTMLSelectElement>('[id^="dropdown__users_id_assign"]')[0].innerHTML =
        '<option value="0" selected="selected">-----</option>'

      //Requerente GROUP
      document.querySelector('[id^="dropdown__groups_id_requester"]')!.innerHTML = 
        `<option value="${value.id}" selected="selected">${value.name}</option>`

      //Observador GROUP
      document.querySelector('[id^="dropdown__groups_id_observer"]')!.innerHTML = 
        `<option value="${value.id}" selected="selected">${value.name}</option>`

      //Atribuído para GROUP
      document.querySelector('[id^="dropdown__groups_id_assign"]')!.innerHTML = 
        '<option value="145" selected="selected">Infraestrutura T.I</option>'
    }, units)
  }

   /**
   * Preenche o campo título do chamado.
   */

  private async fillTitle (page: Page) {
    await page.type("#mainformtable4 input", 'Verificar backup FTP Servidor')
  }

  /**
   * Preenche o campo descrição do chamado (iframe).
   */

  private async fillDescription (page: Page) {
     // Descrição => Espera o iframe aparecer e enviar texto no campo descrição
    await page.waitForSelector('iframe[id^="content"]');
    const iframeElement: ElementHandle<any> | null = await page.$('iframe[id^="content"]')
    const frame = await iframeElement?.contentFrame()
    await frame?.evaluate(() => {
      const p = document.querySelector('p')
      if (p) {
        p.textContent = 'Validar a conexão do FTP e evidenciar.'
      }
    })

    // Espera o iframe aparecer
    await page.waitForSelector('iframe[id^="content"]');
  }
  
   /**
   * Aguarda até que um seletor esteja disponível na página.
   * 
   * @param page Instância da página Puppeteer.
   * @param selector Seletor CSS para aguardar.
   */

  private async waitForFunction (page: Page, selector: string) {
    return await page.waitForFunction((value) => {
      return document.querySelector(value)
    }, { timeout: 10000 }, selector)
  }
}