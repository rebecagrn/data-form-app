import type { Client } from '../entities/client.entity';

export class ClientResponseDto {
  id!: string;
  fullName!: string;
  cpf!: string;
  email!: string;
  favoriteColor!: string;
  notes!: string | null;
  createdAt!: Date;

  static fromEntity(client: Client): ClientResponseDto {
    const response = new ClientResponseDto();
    response.id = client.id;
    response.fullName = client.fullName;
    response.cpf = client.cpf;
    response.email = client.email;
    response.favoriteColor = client.favoriteColor;
    response.notes = client.notes;
    response.createdAt = client.createdAt;
    return response;
  }
}
