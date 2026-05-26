import { Controller, type Control, type FieldError } from 'react-hook-form'
import { Check } from 'lucide-react'
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
      <Label id="favoriteColor-label">Cor preferida</Label>
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
                    'group relative flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all',
                    'hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'border-border bg-background',
                  )}
                >
                  <span
                    className="relative flex size-8 items-center justify-center rounded-full shadow-inner ring-1 ring-black/10"
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
