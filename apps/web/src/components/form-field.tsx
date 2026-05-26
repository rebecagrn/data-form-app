import type { ReactNode } from 'react'
import { FieldHint } from '@/components/field-hint'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormFieldProps = {
  id: string
  label: string
  tip?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({ id, label, tip, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-foreground text-sm font-medium">
          {label}
        </Label>
        {tip && <FieldHint tip={tip} />}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
