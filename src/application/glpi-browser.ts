import puppeteer, { Browser, Page } from "puppeteer"

type UserType = {
  user: string
  password: string
}

export class GlpiBrowser {
  public user: UserType
  public page!: Page
  public browser!: Browser

  constructor(login: UserType){
    this.user = login
  }

  public async setBrowser(){
    this.browser = await puppeteer.launch({ headless: false })
    const page = await this.browser.newPage()
    this.page = page
  }

  public async browserClose(){
    this.browser.close()
  }
}