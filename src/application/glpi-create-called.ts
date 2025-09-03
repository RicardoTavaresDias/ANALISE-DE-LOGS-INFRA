import { GlpiBrowser } from "./glpi-browser"

export class GlpiCreateCalled {
  constructor (private browser: GlpiBrowser) {}

  // ##########
  async treeUnits (unitTeste: any) {
    const page = this.browser.getPage()
    
    await page.waitForSelector("#global_entity_select", { timeout: 10000 })
    setTimeout(async () => await page.click("#global_entity_select"), 500)

    await page.waitForSelector(".jstree-closed", { timeout: 10000 })
    await page.click(".jstree-icon")

    await page.waitForFunction((value) => {
      //@ts-ignore
    return [...document.querySelectorAll(".jstree-anchor")]
      .some(el => el.textContent?.includes(value));
    }, { timeout: 10000 }, unitTeste) // função que chama a pasta tmp, return unit

    await page.evaluate((unit) => {
      //@ts-ignore
      const node = [...document.querySelectorAll(".jstree-children .jstree-anchor")].find(value => value.textContent.includes(unit))
      node?.click()
    }, unitTeste) // função que chama a pasta tmp, return unit

    this.newCalled(page)
  }

  private async newCalled (page: any) {
    await page.goto("https://glpi.ints.org.br/front/ticket.form.php", { timeout: 35000 })

    /*
      ########################################################################

        # campo titulo
          document.querySelector("#mainformtable4 input").value = "ola"
        # Descrição
          document.querySelector("#tinymce").innerText = "osdfsdf"
        # botão Adicionar
          document.querySelector(".submit").click()

        #######################################################

        # Tipo Requisição
          dropdown_type286619369
          document.querySelectorAll(".select2-hidden-accessible")[3].value = "2"
          document.querySelectorAll(".select2-hidden-accessible")[3].onchange()
        # Categoria
          dropdown_itilcategories_id2026503822
          document.querySelectorAll(".select2-hidden-accessible")[4].innerHTML = '<option value=""1030 selected="selected">BACKUP > Acompanhamento Diario Rotina de Backup</option>'

        #######################################################

        # Requerente GROUP
          document.querySelector("#dropdown__groups_id_requester1829935631").innerHTML = '<option value="170" selected="selected">UBS/ESF Mar Paulista</option>'
        # Observador GROUP
          document.querySelector("#dropdown__groups_id_observer153146980").innerHTML = '<option value="170" selected="selected">UBS/ESF Mar Paulista</option>'

    */
    
  }
}