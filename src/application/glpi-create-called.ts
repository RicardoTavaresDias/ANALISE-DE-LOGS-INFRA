import { GlpiBrowser } from "./glpi-browser"
import { ElementHandle } from "puppeteer"
import type { IStandardizationUnits } from "@/lib/standardization-units"
import { AppError } from "@/utils/AppError"

export class GlpiCreateCalled {
  constructor (private browser: GlpiBrowser) {}

  async treeUnits (unitName: IStandardizationUnits["name"]) {
    const page = this.browser.getPage()
    
    await page.waitForSelector("#global_entity_select", { timeout: 10000 })
      .catch(() => {
        throw new AppError("Não foi possível carregar o seletor de unidades")
      }
    )

    await page.click("#global_entity_select")
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

    await page.goto("https://glpi.ints.org.br/front/ticket.form.php", { timeout: 35000 })

    // Aguardar o campo tipo
    await page.waitForFunction(() => {
      return document.querySelector('[id^="dropdown_type"]')
    }, { timeout: 10000 })

    // Tipo - Requisição
    await page.evaluate(() => {
      document.querySelector<HTMLSelectElement>('[id^="dropdown_type"]')!.value = "2"
      document.querySelector<any>('[id^="dropdown_type"]').onchange()
    })

    // Aguardar o campo tipo
    await page.waitForFunction(() => {
      return document.querySelector('[id^="dropdown_type"]')
    }, { timeout: 10000 })

    await page.evaluate((value) => {
      //Categoria - BACKUP > Acompanhamento Diario Rotina de Backup
      document.querySelector('[id^="select2-dropdown_itilcategories"]')!.innerHTML = 
        '<option value="1030" selected="selected">BACKUP > Acompanhamento Diario Rotina de Backup</option>'

      //Requerente (user)
      document.querySelector('[id^="dropdown__users_id_requester"]')!.innerHTML = 
        '<option value="0" selected="selected">-----</option>'

      //Atribuído para (user)
      document.querySelector<HTMLSelectElement>('[id^="dropdown__users_id_assign"]')!.innerHTML = 
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

    /*
      # botão Adicionar
        document.querySelector(".submit").click()
    */
    //await page.click(`[type="submit"]`)
  }
}