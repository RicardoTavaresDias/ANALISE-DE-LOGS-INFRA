import z from "zod"

export const loginSchema = z.object({
  user: z.string().min(1, { message: "Usuario obrigatório" }),
  password: z.string().min(1, { message: "Senha obrigatório" }),
  dateInterval: z.object({
    dateEnd: z.string(),
    dateStart: z.string()
  },{ message: "Informe o intervalo de datas" })
})

export type LoginType = z.infer<typeof loginSchema>
export type DateType = Omit<LoginType, "user" | "password">