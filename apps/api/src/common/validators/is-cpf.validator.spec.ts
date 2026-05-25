import { isValidCpf } from './is-cpf.validator'

describe('isValidCpf', () => {
  it('should accept a valid CPF', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('52998224725')).toBe(true)
  })

  it('should reject invalid CPF', () => {
    expect(isValidCpf('11111111111')).toBe(false)
    expect(isValidCpf('123')).toBe(false)
    expect(isValidCpf('00000000000')).toBe(false)
  })
})
