import { z } from 'zod'
import { RAINBOW_COLORS } from '@/lib/constants/rainbow-colors'
import { isValidCpf } from '@/lib/validators/cpf'

export const clientFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  email: z.email('E-mail inválido'),
  favoriteColor: z.enum(RAINBOW_COLORS, {
    error: 'Selecione uma cor',
  }),
  notes: z.string().max(2000, 'Observações muito longas').optional(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>

export type CreateClientPayload = ClientFormValues

export type ClientResponse = {
  id: string
  fullName: string
  cpf: string
  email: string
  favoriteColor: string
  notes: string | null
  createdAt: string
}
