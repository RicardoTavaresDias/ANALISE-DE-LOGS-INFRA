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
          obs: iframeElement
          document.querySelector("#tinymce").innerText = "osdfsdf"
          $$$$$$$$$$$$$$$$$
              const iframe = document.querySelector('iframe[id^="content"]')
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
              const p = iframeDoc.querySelector('p')
              if (p) {
                p.textContent = "Texto alterado direto no Chrome 🚀"
              }
          $$$$$$$$$$$$$$$$$$
        # botão Adicionar
          document.querySelector(".submit").click()

        #######################################################

        # Tipo Requisição
          document.querySelectorAll(".select2-hidden-accessible")[3].value = "2"
          document.querySelectorAll(".select2-hidden-accessible")[3].onchange()
        # Categoria
          document.querySelectorAll(".select2-hidden-accessible")[4].innerHTML = '<option value=""1030 selected="selected">BACKUP > Acompanhamento Diario Rotina de Backup</option>'

        #######################################################

        # Requerente GROUP
          document.querySelectorAll(".select2-hidden-accessible")[8].innerHTML = '<option value="170" selected="selected">UBS/ESF Mar Paulista</option>'
        # Observador GROUP
          document.querySelectorAll(".select2-hidden-accessible")[11].innerHTML = '<option value="170" selected="selected">UBS/ESF Mar Paulista</option>'
        # Atribuído para GROUP
          document.querySelectorAll(".select2-hidden-accessible")[14].innerHTML = '<option value="145" selected="selected">Infraestrutura T.I</option>'

    */
    
  }
}