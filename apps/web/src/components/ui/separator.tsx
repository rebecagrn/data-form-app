import * as React from 'react'

import { cn } from '@/lib/utils'

const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { decorative?: boolean }
>(({ className, decorative = true, ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? 'none' : 'separator'}
    aria-orientation="horizontal"
    className={cn('bg-border shrink-0 h-px w-full', className)}
    {...props}
  />
))
Separator.displayName = 'Separator'

export { Separator }
