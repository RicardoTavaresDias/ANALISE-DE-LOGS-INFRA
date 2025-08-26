import z from "zod"

export const loginSchema = z.object({
  user: z.string().min(1, { message: "Usuario obrigatório" }),
  password: z.string().min(1, { message: "Senha obrigatório" }),
})

export type LoginType = z.infer<typeof loginSchema>