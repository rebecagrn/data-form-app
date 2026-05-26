import { Controller, type Control, type FieldError } from 'react-hook-form'
import { Check } from 'lucide-react'
import { FieldHint } from '@/components/field-hint'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  RAINBOW_COLOR_LABELS,
  RAINBOW_COLOR_SWATCHES,
  RAINBOW_COLORS,
} from '@/lib/constants/rainbow-colors'
import type { ClientFormValues } from '@/lib/schemas/client-form.schema'

type FavoriteColorFieldProps = {
  control: Control<ClientFormValues>
  error?: FieldError
}

export function FavoriteColorField({ control, error }: FavoriteColorFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Label id="favoriteColor-label" className="text-foreground text-sm font-medium">
          Cor preferida
        </Label>
        <FieldHint tip="Escolha uma cor do arco-íris para o perfil do cliente." />
      </div>
      <Controller
        name="favoriteColor"
        control={control}
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-labelledby="favoriteColor-label"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'favoriteColor-error' : undefined}
            className="grid grid-cols-4 gap-2 sm:grid-cols-7"
          >
            {RAINBOW_COLORS.map((color) => {
              const isSelected = field.value === color
              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={RAINBOW_COLOR_LABELS[color]}
                  onClick={() => field.onChange(color)}
                  className={cn(
                    'group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-2 transition-all',
                    'hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30'
                      : 'border-border bg-input/60',
                  )}
                >
                  <span
                    className="relative flex size-8 items-center justify-center rounded-full shadow-inner ring-1 ring-black/15 dark:ring-white/15"
                    style={{ backgroundColor: RAINBOW_COLOR_SWATCHES[color] }}
                  >
                    {isSelected && (
                      <Check
                        className="size-4 text-white drop-shadow-sm"
                        strokeWidth={3}
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-medium leading-none sm:text-xs">
                    {RAINBOW_COLOR_LABELS[color]}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      />
      {error && (
        <p id="favoriteColor-error" className="text-destructive text-sm font-medium">
          {error.message}
        </p>
      )}
    </div>
  )
}
