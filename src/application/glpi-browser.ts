import puppeteer, { Browser, Page } from "puppeteer"
import { Credentials } from "./interface/ICredentials"

export class GlpiBrowser {
  public credentials: Credentials
  private page!: Page
  private browser!: Browser

  constructor(login: Credentials){
    this.credentials = login
  }

  async setBrowser(){
    this.browser = await puppeteer.launch({ headless: false })
    const page = await this.browser.newPage()
    this.page = page
  }

  getPage(): Page {
    return this.page
  }

  async browserClose(){
    await this.browser.close()
  }
}