import type { Client } from '../entities/client.entity';
import { ClientListItemDto } from './client-list-item.dto';

export class ClientListResponseDto {
  items!: ClientListItemDto[];
  total!: number;
  page!: number;
  limit!: number;

  static fromFindResult({
    clients,
    total,
    page,
    limit,
  }: {
    clients: Client[];
    total: number;
    page: number;
    limit: number;
  }): ClientListResponseDto {
    const response = new ClientListResponseDto();
    response.items = clients.map((client) => ClientListItemDto.fromEntity(client));
    response.total = total;
    response.page = page;
    response.limit = limit;
    return response;
  }
}
