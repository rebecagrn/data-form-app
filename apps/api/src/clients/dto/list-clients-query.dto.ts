import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { CLIENTS_PAGINATION } from '../clients.constants';

export class ListClientsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(CLIENTS_PAGINATION.DEFAULT_PAGE)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CLIENTS_PAGINATION.MAX_LIMIT)
  limit?: number;
}
