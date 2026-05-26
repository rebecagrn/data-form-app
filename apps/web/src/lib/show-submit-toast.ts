import { toast } from 'sonner'

export const showSubmitSuccessToast = () => {
  toast.success('Cadastro concluído', {
    description: 'Cadastro realizado com sucesso!',
    duration: 5000,
  })
}

export const showSubmitErrorToast = (message: string) => {
  toast.error('Não foi possível cadastrar', {
    description: message,
    duration: 7000,
  })
}
