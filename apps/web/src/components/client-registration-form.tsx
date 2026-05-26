import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SubmitFeedback } from '@/components/submit-feedback'
import {
  RAINBOW_COLOR_LABELS,
  RAINBOW_COLORS,
} from '@/lib/constants/rainbow-colors'
import { createClient, getApiErrorMessage } from '@/lib/clients-api'
import {
  clientFormSchema,
  type ClientFormValues,
} from '@/lib/schemas/client-form.schema'
import { formatCpf } from '@/lib/validators/cpf'
import { useUiStore } from '@/stores/ui.store'

const defaultValues: ClientFormValues = {
  fullName: '',
  cpf: '',
  email: '',
  favoriteColor: 'blue',
  notes: undefined,
}

export function ClientRegistrationForm() {
  const setSubmitFeedback = useUiStore((state) => state.setSubmitFeedback)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: (payload: ClientFormValues) => createClient(payload),
    onSuccess: () => {
      reset(defaultValues)
      setSubmitFeedback({
        type: 'success',
        message: 'Cadastro realizado com sucesso!',
      })
    },
    onError: (error) => {
      setSubmitFeedback({
        type: 'error',
        message: getApiErrorMessage(error),
      })
    },
  })

  const handleFormSubmit = (values: ClientFormValues) => {
    setSubmitFeedback(null)
    const trimmedNotes = values.notes?.trim()
    mutation.mutate({
      ...values,
      cpf: values.cpf.replace(/\D/g, ''),
      notes: trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : undefined,
    })
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Cadastro de clientes
        </h1>
        <p className="text-muted-foreground text-sm">
          Preencha os dados abaixo. Cada CPF e e-mail pode ser cadastrado apenas
          uma vez.
        </p>
      </header>

      <SubmitFeedback />

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p id="fullName-error" className="text-destructive text-sm">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            aria-invalid={Boolean(errors.cpf)}
            aria-describedby={errors.cpf ? 'cpf-error' : undefined}
            {...register('cpf', {
              onChange: (event) => {
                setValue('cpf', formatCpf(event.target.value), {
                  shouldValidate: true,
                })
              },
            })}
          />
          {errors.cpf && (
            <p id="cpf-error" className="text-destructive text-sm">
              {errors.cpf.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-destructive text-sm">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="favoriteColor">Cor preferida</Label>
          <select
            id="favoriteColor"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={Boolean(errors.favoriteColor)}
            aria-describedby={
              errors.favoriteColor ? 'favoriteColor-error' : undefined
            }
            {...register('favoriteColor')}
          >
            {RAINBOW_COLORS.map((color) => (
              <option key={color} value={color}>
                {RAINBOW_COLOR_LABELS[color]}
              </option>
            ))}
          </select>
          {errors.favoriteColor && (
            <p id="favoriteColor-error" className="text-destructive text-sm">
              {errors.favoriteColor.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            rows={4}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? 'notes-error' : undefined}
            {...register('notes')}
          />
          {errors.notes && (
            <p id="notes-error" className="text-destructive text-sm">
              {errors.notes.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Enviando...' : 'Enviar cadastro'}
        </Button>
      </form>
    </div>
  )
}
