import { maskCpf } from '../../common/utils/mask-cpf';
import type { Client } from '../entities/client.entity';

export class ClientListItemDto {
  id!: string;
  fullName!: string;
  cpf!: string;
  email!: string;
  favoriteColor!: string;
  notes!: string | null;
  createdAt!: Date;

  static fromEntity(client: Client): ClientListItemDto {
    const item = new ClientListItemDto();
    item.id = client.id;
    item.fullName = client.fullName;
    item.cpf = maskCpf(client.cpf);
    item.email = client.email;
    item.favoriteColor = client.favoriteColor;
    item.notes = client.notes;
    item.createdAt = client.createdAt;
    return item;
  }
}
