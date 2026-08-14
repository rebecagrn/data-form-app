import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { QueryFailedError, type Repository } from 'typeorm';
import { CACHE } from '../cache/cache.constants';
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
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(query: ListClientsQueryDto): Promise<ClientListResponseDto> {
    const page = query.page ?? CLIENTS_PAGINATION.DEFAULT_PAGE;
    const limit = query.limit ?? CLIENTS_PAGINATION.DEFAULT_LIMIT;
    try {
      const cacheKey = await this.buildListCacheKey(page, limit);
      return await this.cacheManager.wrap(
        cacheKey,
        () => this.loadListPage(page, limit),
        CACHE.CLIENTS_LIST_TTL_MS,
      );
    } catch (error) {
      this.logger.warn(`Client list cache unavailable: ${String(error)}`);
      return this.loadListPage(page, limit);
    }
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
      await this.invalidateListCache();
      return ClientResponseDto.fromEntity(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('A client with this CPF or email is already registered');
      }
      throw error;
    }
  }

  private async loadListPage(page: number, limit: number): Promise<ClientListResponseDto> {
    const [clients, total] = await this.clientsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return ClientListResponseDto.fromFindResult({ clients, total, page, limit });
  }

  private async buildListCacheKey(page: number, limit: number): Promise<string> {
    const version = (await this.cacheManager.get<string>(CACHE.CLIENTS_LIST_VERSION_KEY)) ?? '0';
    return `${CACHE.CLIENTS_LIST_PREFIX}:${version}:${page}:${limit}`;
  }

  private async invalidateListCache(): Promise<void> {
    try {
      await this.cacheManager.set(CACHE.CLIENTS_LIST_VERSION_KEY, String(Date.now()));
    } catch (error) {
      this.logger.warn(`Could not invalidate client list cache: ${String(error)}`);
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
