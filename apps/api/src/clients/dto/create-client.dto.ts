import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  RAINBOW_COLORS,
  type RainbowColor,
} from '../../common/constants/rainbow-colors.constant';
import { IsCpf } from '../../common/validators/is-cpf.validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @IsCpf()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  cpf!: string;

  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([...RAINBOW_COLORS])
  favoriteColor!: RainbowColor;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  notes?: string;
}
