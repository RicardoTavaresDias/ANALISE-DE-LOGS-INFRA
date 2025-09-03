import { GlpiBrowser } from "./glpi-browser"
import { taskCalled } from "@/services/glpi-task-called.services"

export class GlpiCreateCalled {
  constructor (private browser: GlpiBrowser) {}

  // ##########
  async treeUnits (unitTeste) {
    console.log(unitTeste)
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
  }
}