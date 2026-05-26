import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

const CPF_LENGTH = 11;

const isRepeatedDigits = (digits: string): boolean => /^(\d)\1+$/.test(digits);

const calculateCheckDigit = (digits: string, factor: number): number => {
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    sum += Number(digits[index]) * (factor - index);
  }
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
};

export const isValidCpf = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== CPF_LENGTH) {
    return false;
  }
  if (isRepeatedDigits(digits)) {
    return false;
  }
  const base = digits.slice(0, 9);
  const firstCheck = calculateCheckDigit(base, 10);
  if (firstCheck !== Number(digits[9])) {
    return false;
  }
  const secondCheck = calculateCheckDigit(base + digits[9], 11);
  return secondCheck === Number(digits[10]);
};

@ValidatorConstraint({ name: 'isCpf', async: false })
export class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return isValidCpf(value);
  }

  defaultMessage(): string {
    return 'cpf must be a valid Brazilian CPF';
  }
}

export const IsCpf = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfConstraint,
    });
  };
};
