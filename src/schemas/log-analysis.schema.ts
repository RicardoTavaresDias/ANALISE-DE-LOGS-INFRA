import z from "zod"

export const dateSchema = z.object({
  dateStart: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' }),
  dateEnd: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
})

export type DateType = z.infer<typeof dateSchema> 