import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, type Repository } from 'typeorm';
import { CLIENTS_PAGINATION } from './clients.constants';
import { ClientListResponseDto } from './dto/client-list-response.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import type { CreateClientDto } from './dto/create-client.dto';
import type { ListClientsQueryDto } from './dto/list-clients-query.dto';
import { Client } from './entities/client.entity';

const POSTGRES_UNIQUE_VIOLATION = '23505';
const SQLITE_UNIQUE_VIOLATION = 'SQLITE_CONSTRAINT_UNIQUE';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async findAll(query: ListClientsQueryDto): Promise<ClientListResponseDto> {
    const page = query.page ?? CLIENTS_PAGINATION.DEFAULT_PAGE;
    const limit = query.limit ?? CLIENTS_PAGINATION.DEFAULT_LIMIT;
    const [clients, total] = await this.clientsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return ClientListResponseDto.fromFindResult({ clients, total, page, limit });
  }

  async create(dto: CreateClientDto): Promise<ClientResponseDto> {
    const client = this.clientsRepository.create({
      fullName: dto.fullName,
      cpf: dto.cpf,
      email: dto.email,
      favoriteColor: dto.favoriteColor,
      notes: dto.notes ?? null,
    });
    try {
      const saved = await this.clientsRepository.save(client);
      return ClientResponseDto.fromEntity(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('A client with this CPF or email is already registered');
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const driverError = error.driverError as { code?: string };
    const code = driverError?.code ?? (error as QueryFailedError & { code?: string }).code;
    return code === POSTGRES_UNIQUE_VIOLATION || code === SQLITE_UNIQUE_VIOLATION;
  }
}
