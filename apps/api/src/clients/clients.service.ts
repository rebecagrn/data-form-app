import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository } from 'typeorm'
import { CreateClientDto } from './dto/create-client.dto'
import { ClientResponseDto } from './dto/client-response.dto'
import { Client } from './entities/client.entity'

const POSTGRES_UNIQUE_VIOLATION = '23505'
const SQLITE_UNIQUE_VIOLATION = 'SQLITE_CONSTRAINT_UNIQUE'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto): Promise<ClientResponseDto> {
    const client = this.clientsRepository.create({
      fullName: dto.fullName,
      cpf: dto.cpf,
      email: dto.email,
      favoriteColor: dto.favoriteColor,
      notes: dto.notes ?? null,
    })
    try {
      const saved = await this.clientsRepository.save(client)
      return ClientResponseDto.fromEntity(saved)
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'A client with this CPF or email is already registered',
        )
      }
      throw error
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false
    }
    const driverError = error.driverError as { code?: string }
    const code = driverError?.code ?? (error as QueryFailedError & { code?: string }).code
    return (
      code === POSTGRES_UNIQUE_VIOLATION || code === SQLITE_UNIQUE_VIOLATION
    )
  }
}
