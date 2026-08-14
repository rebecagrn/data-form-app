const CPF_LENGTH = 11;
const MASKED_CPF_PREFIX = '***.***.***-';

export function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== CPF_LENGTH) {
    return `${MASKED_CPF_PREFIX}**`;
  }
  return `${MASKED_CPF_PREFIX}${digits.slice(9)}`;
}
