import z from "zod"
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar o arquivo .env de forma dinâmica
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  URL: z.string().url(),
  OFFBROWSER: z.string().transform(value => {
    return value.toLowerCase() === 'false' ? '--window-position=2000,2000' : ''
  }),
  PATCHFILE: z.string().default('./unidade')
})

const env = envSchema.parse(process.env)
export { env }