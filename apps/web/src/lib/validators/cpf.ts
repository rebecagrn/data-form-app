const CPF_LENGTH = 11

const isRepeatedDigits = (digits: string): boolean =>
  /^(\d)\1+$/.test(digits)

const calculateCheckDigit = (digits: string, factor: number): number => {
  let sum = 0
  for (let index = 0; index < digits.length; index += 1) {
    sum += Number(digits[index]) * (factor - index)
  }
  const remainder = (sum * 10) % 11
  return remainder === 10 ? 0 : remainder
}

export const isValidCpf = (value: string): boolean => {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== CPF_LENGTH) {
    return false
  }
  if (isRepeatedDigits(digits)) {
    return false
  }
  const base = digits.slice(0, 9)
  const firstCheck = calculateCheckDigit(base, 10)
  if (firstCheck !== Number(digits[9])) {
    return false
  }
  const secondCheck = calculateCheckDigit(base + digits[9], 11)
  return secondCheck === Number(digits[10])
}

export const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, CPF_LENGTH)
  if (digits.length <= 3) {
    return digits
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}
