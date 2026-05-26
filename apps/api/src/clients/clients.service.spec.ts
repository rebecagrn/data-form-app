import { ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, type Repository } from 'typeorm';
import { ClientsService } from './clients.service';
import type { CreateClientDto } from './dto/create-client.dto';
import { Client } from './entities/client.entity';

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: jest.Mocked<Pick<Repository<Client>, 'create' | 'save'>>;

  const inputDto: CreateClientDto = {
    fullName: 'John Doe',
    cpf: '52998224725',
    email: 'john@example.com',
    favoriteColor: 'blue',
    notes: 'VIP client',
  };

  const savedClient: Client = {
    id: 'uuid-1',
    fullName: inputDto.fullName,
    cpf: inputDto.cpf,
    email: inputDto.email,
    favoriteColor: inputDto.favoriteColor,
    notes: inputDto.notes ?? null,
    createdAt: new Date('2026-05-25T00:00:00.000Z'),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockReturnValue(savedClient),
      save: jest.fn().mockResolvedValue(savedClient),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: repository,
        },
      ],
    }).compile();
    service = module.get<ClientsService>(ClientsService);
  });

  it('should register a client', async () => {
    const actual = await service.create(inputDto);
    expect(repository.create).toHaveBeenCalledWith({
      fullName: inputDto.fullName,
      cpf: inputDto.cpf,
      email: inputDto.email,
      favoriteColor: inputDto.favoriteColor,
      notes: inputDto.notes,
    });
    expect(actual.id).toBe(savedClient.id);
    expect(actual.cpf).toBe(inputDto.cpf);
  });

  it('should throw conflict when CPF or email already exists', async () => {
    const duplicateError = new QueryFailedError('INSERT', [], new Error('duplicate key'));
    (duplicateError as QueryFailedError & { driverError: { code: string } }).driverError = {
      code: '23505',
    };
    repository.save.mockRejectedValueOnce(duplicateError);
    await expect(service.create(inputDto)).rejects.toThrow(ConflictException);
  });
});
