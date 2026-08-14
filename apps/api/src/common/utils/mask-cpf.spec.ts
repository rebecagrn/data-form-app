import { maskCpf } from './mask-cpf';

describe('maskCpf', () => {
  it('should keep only the check digits visible', () => {
    expect(maskCpf('52998224725')).toBe('***.***.***-25');
    expect(maskCpf('529.982.247-25')).toBe('***.***.***-25');
  });

  it('should not leak digits when the value is not a CPF', () => {
    expect(maskCpf('123')).toBe('***.***.***-**');
    expect(maskCpf('')).toBe('***.***.***-**');
  });
});
