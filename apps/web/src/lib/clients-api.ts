import { isAxiosError } from 'axios'
import { api } from '@/lib/api'
import type {
  ClientResponse,
  CreateClientPayload,
} from '@/lib/schemas/client-form.schema'

export const createClient = async (
  payload: CreateClientPayload,
): Promise<ClientResponse> => {
  const { data } = await api.post<ClientResponse>('/clients', payload)
  return data
}

export const getApiErrorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) {
    return 'Não foi possível enviar o cadastro. Tente novamente.'
  }
  const responseMessage = error.response?.data?.message
  if (Array.isArray(responseMessage)) {
    return responseMessage.join('. ')
  }
  if (typeof responseMessage === 'string') {
    if (responseMessage.includes('already registered')) {
      return 'Este CPF ou e-mail já está cadastrado.'
    }
    return responseMessage
  }
  if (error.response?.status === 409) {
    return 'Este CPF ou e-mail já está cadastrado.'
  }
  return 'Não foi possível enviar o cadastro. Tente novamente.'
}
