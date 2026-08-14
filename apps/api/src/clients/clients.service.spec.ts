import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, type Repository } from 'typeorm';
import { CACHE } from '../cache/cache.constants';
import { ClientsService } from './clients.service';
import type { CreateClientDto } from './dto/create-client.dto';
import { Client } from './entities/client.entity';

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: jest.Mocked<Pick<Repository<Client>, 'create' | 'save' | 'findAndCount'>>;
  const cacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    wrap: jest.fn(),
  };

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
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    cacheManager.get.mockReset().mockResolvedValue(undefined);
    cacheManager.set.mockReset().mockResolvedValue(undefined);
    cacheManager.wrap
      .mockReset()
      .mockImplementation((_key: string, loader: () => Promise<unknown>) => loader());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: repository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();
    service = module.get<ClientsService>(ClientsService);
  });

  it('should register a client and invalidate the list cache', async () => {
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
    expect(cacheManager.set).toHaveBeenCalledWith(
      CACHE.CLIENTS_LIST_VERSION_KEY,
      expect.any(String),
    );
  });

  it('should list clients with pagination and masked CPF', async () => {
    repository.findAndCount.mockResolvedValueOnce([[savedClient], 1]);
    const actual = await service.findAll({ page: 2, limit: 10 });
    expect(repository.findAndCount).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      skip: 10,
      take: 10,
    });
    expect(actual.total).toBe(1);
    expect(actual.page).toBe(2);
    expect(actual.limit).toBe(10);
    expect(actual.items).toHaveLength(1);
    expect(actual.items[0].cpf).toBe('***.***.***-25');
    expect(actual.items[0].fullName).toBe(savedClient.fullName);
  });

  it('should return an empty page when there are no clients', async () => {
    const actual = await service.findAll({});
    expect(repository.findAndCount).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 20,
    });
    expect(actual).toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });
  });

  it('should return cached clients without querying the database', async () => {
    const cachedList = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    };
    cacheManager.wrap.mockResolvedValueOnce(cachedList);
    const actual = await service.findAll({});
    expect(actual).toEqual(cachedList);
    expect(repository.findAndCount).not.toHaveBeenCalled();
  });

  it('should throw conflict when CPF or email already exists', async () => {
    const driverError = new Error('duplicate key') as Error & { code: string };
    driverError.code = '23505';
    const duplicateError = new QueryFailedError('INSERT', [], driverError);
    repository.save.mockRejectedValueOnce(duplicateError);
    await expect(service.create(inputDto)).rejects.toThrow(ConflictException);
    expect(cacheManager.set).not.toHaveBeenCalled();
  });
});
