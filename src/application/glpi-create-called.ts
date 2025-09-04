import { GlpiBrowser } from "./glpi-browser"
import { ElementHandle, Page } from "puppeteer"
import type { IStandardizationUnits } from "@/lib/standardization-units"

type NewCalledType = {
  page: Page
  units: IStandardizationUnits
}

export class GlpiCreateCalled {
  constructor (private browser: GlpiBrowser) {}

  async treeUnits (unitTeste: IStandardizationUnits) {
    const page = this.browser.getPage()
    
    await page.waitForSelector("#global_entity_select", { timeout: 10000 })
    await page.click("#global_entity_select")

    await page.waitForSelector(".jstree-closed", { timeout: 10000 })
    await page.click(".jstree-icon")

    await page.waitForFunction((nameUnit) => {
      //@ts-ignore
      return [...document.querySelectorAll(".jstree-anchor")]
      .some(el => el.textContent?.includes(nameUnit));
    }, { timeout: 10000 }, unitTeste.name) // função que chama a pasta tmp, return unit

    await page.evaluate((nameUnit) => {
      //@ts-ignore
      const node = [...document.querySelectorAll(".jstree-children .jstree-anchor")].find(value => value.textContent.includes(nameUnit))
      node?.click()
    }, unitTeste.name) // função que chama a pasta tmp, return unit

    await this.newCalled({ page, units: unitTeste })
  }

  private async newCalled ({ page, units }: NewCalledType) {
    await page.goto("https://glpi.ints.org.br/front/ticket.form.php", { timeout: 35000 })

    // Aguardar o campo tipo
    await page.waitForFunction(() => {
      //@ts-ignore
      return document.querySelector('[id^="dropdown_type"]')
    }, { timeout: 10000 })

    // Tipo - Requisição
    await page.evaluate(() => {
      //@ts-ignore
      document.querySelector('[id^="dropdown_type"]').value = "2"
      //@ts-ignore
      document.querySelector('[id^="dropdown_type"]').onchange()
    })

    // Aguardar o campo tipo
    await page.waitForFunction(() => {
      //@ts-ignore
      return document.querySelector('[id^="dropdown_type"]')
    }, { timeout: 10000 })

    await page.evaluate((value) => {
      //@ts-ignore => Categoria - BACKUP > Acompanhamento Diario Rotina de Backup
      document.querySelector('[id^="select2-dropdown_itilcategories"]').innerHTML = 
        '<option value="1030" selected="selected">BACKUP > Acompanhamento Diario Rotina de Backup</option>'

      //@ts-ignore => Requerente (user)
      document.querySelector('[id^="dropdown__users_id_requester"]').innerHTML = 
        '<option value="0" selected="selected">-----</option>'

      //@ts-ignore => Atribuído para (user)
      document.querySelector('[id^="dropdown__users_id_assign"]').innerHTML = 
        '<option value="0" selected="selected">-----</option>'

      //@ts-ignore => Requerente GROUP
      document.querySelector('[id^="dropdown__groups_id_requester"]').innerHTML = 
        `<option value="${value.id}" selected="selected">${value.name}</option>`

      //@ts-ignore => Observador GROUP
      document.querySelector('[id^="dropdown__groups_id_observer"]').innerHTML = 
        `<option value="${value.id}" selected="selected">${value.name}</option>`

      //@ts-ignore => Atribuído para GROUP
      document.querySelector('[id^="dropdown__groups_id_assign"]').innerHTML = 
        '<option value="145" selected="selected">Infraestrutura T.I</option>'
    }, units)

    // Título
    await page.type("#mainformtable4 input", 'Verificar backup FTP Servidor')

    // Descrição => Espera o iframe aparecer e enviar texto no campo descrição
    await page.waitForSelector('iframe[id^="content"]');
    const iframeElement: ElementHandle<any> | null = await page.$('iframe[id^="content"]')
    const frame = await iframeElement?.contentFrame()
    await frame?.evaluate(() => {
      //@ts-ignore
      const p = document.querySelector('p')
      if (p) {
        p.textContent = 'Validar a conexão do FTP e evidenciar.'
      }
    })

    /*
      # botão Adicionar
        document.querySelector(".submit").click()
    */
    //await page.click(`[type="submit"]`)
  }
}