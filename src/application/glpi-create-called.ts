import { GlpiBrowser } from "./glpi-browser"
import { ElementHandle, Page } from "puppeteer"
import type { IStandardizationUnits } from "@/lib/standardization-units"

export class GlpiCreateCalled {
  constructor (private browser: GlpiBrowser) {}

  async treeUnits (unitName: IStandardizationUnits["name"]) {
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

  async newCalled (units: IStandardizationUnits) {
    const page = this.browser.getPage()

    await page.goto("https://glpi.ints.org.br/front/ticket.form.php", { timeout: 35000, waitUntil: 'networkidle0' })

    // Aguardar o campo tipo
    await this.waitForFunction(page, '[id^="dropdown_type"]')

    // Tipo - Requisição
    await page.evaluate(() => {
      document.querySelector<HTMLSelectElement>('[id^="dropdown_type"]')!.value = "2"
      document.querySelector<any>('[id^="dropdown_type"]').onchange()
    })

    // Aguardar o campo tipo
    await this.waitForFunction(page, '[id^="dropdown_type"]')

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

    // Título
    await page.type("#mainformtable4 input", 'Verificar backup FTP Servidor')

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

    await page.click('.submit')

    // Aguardar menssagem de sucesso
    await this.waitForFunction(page, '[id^="message_after_redirect"]')

    const message = await page.evaluate(() => {
      return document.querySelector<HTMLSelectElement>('[id^="message_after_redirect"] a')!.innerText
    })

    console.log('Chamado criado ' + message)
    return message
  }

  private async waitForFunction (page: Page, selector: string) {
    return await page.waitForFunction((value) => {
      return document.querySelector(value)
    }, { timeout: 10000 }, selector)
  }
}