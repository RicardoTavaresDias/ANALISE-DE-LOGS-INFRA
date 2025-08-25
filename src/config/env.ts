import z from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000)
})

const env = envSchema.parse(process.env)
export { env }