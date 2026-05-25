export const RAINBOW_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
] as const

export type RainbowColor = (typeof RAINBOW_COLORS)[number]
