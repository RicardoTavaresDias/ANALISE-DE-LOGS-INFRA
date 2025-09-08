import z from "zod"
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar o arquivo .env de forma dinâmica
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  URL: z.string().url(),
  HEADLESS: z.string().transform(value => value.toLowerCase() === 'true').default('false'),
  PATCHFILE: z.string().default('./unidade')
})

const env = envSchema.parse(process.env)
export { env }