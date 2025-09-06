import z from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  URL: z.string().url(),
  HEADLESS: z.string().transform(value => value.toLowerCase() === 'true').default('false')
})

const env = envSchema.parse(process.env)
export { env }