import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Deve conter pelo menos 1 letra')
    .regex(/\d/, 'Deve conter pelo menos 1 número'),
})

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
})

export const timeEntrySchema = z
  .object({
    title: z.string().min(1, 'Título obrigatório').max(150),
    description: z.string().max(2000).optional(),
    category_id: z.string().uuid('Selecione uma categoria'),
    date: z
      .string()
      .min(1, 'Data obrigatória')
      .refine((v) => new Date(v) <= new Date(), 'Data não pode estar no futuro'),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  })
  .refine((d) => d.end_time > d.start_time, {
    message: 'Término deve ser após o início',
    path: ['end_time'],
  })

export type RegisterForm = z.infer<typeof registerSchema>
export type LoginForm = z.infer<typeof loginSchema>
export type CategoryForm = z.infer<typeof categorySchema>
export type TimeEntryForm = z.infer<typeof timeEntrySchema>
