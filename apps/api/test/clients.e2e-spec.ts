import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { QueryFailedError } from 'typeorm';
import { ClientsController } from '../src/clients/clients.controller';
import { ClientsService } from '../src/clients/clients.service';
import { Client } from '../src/clients/entities/client.entity';

describe('Clients (e2e)', () => {
  let app: INestApplication<App>;
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };
  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    wrap: jest.fn((_key: string, loader: () => Promise<unknown>) => loader()),
  };

  beforeEach(async () => {
    mockRepository.create.mockReset();
    mockRepository.save.mockReset();
    mockRepository.findAndCount.mockReset();
    mockCacheManager.get.mockReset().mockResolvedValue(undefined);
    mockCacheManager.set.mockReset().mockResolvedValue(undefined);
    mockCacheManager.wrap
      .mockReset()
      .mockImplementation((_key: string, loader: () => Promise<unknown>) => loader());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/clients should list clients with masked CPF', () => {
    const savedClient: Client = {
      id: 'uuid-1',
      fullName: 'John Doe',
      cpf: '52998224725',
      email: 'john@example.com',
      favoriteColor: 'blue',
      notes: 'First client',
      createdAt: new Date('2026-05-26T00:00:00.000Z'),
    };
    mockRepository.findAndCount.mockResolvedValue([[savedClient], 1]);

    return request(app.getHttpServer())
      .get('/api/clients')
      .expect(200)
      .expect((response) => {
        expect(response.body.total).toBe(1);
        expect(response.body.page).toBe(1);
        expect(response.body.limit).toBe(20);
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].cpf).toBe('***.***.***-25');
        expect(response.body.items[0].email).toBe('john@example.com');
      });
  });

  it('GET /api/clients should return 400 for invalid pagination', () => {
    return request(app.getHttpServer()).get('/api/clients?page=0&limit=100').expect(400);
  });

  it('POST /api/clients should create a client', () => {
    const savedClient: Client = {
      id: 'uuid-1',
      fullName: 'John Doe',
      cpf: '52998224725',
      email: 'john@example.com',
      favoriteColor: 'blue',
      notes: 'First client',
      createdAt: new Date('2026-05-26T00:00:00.000Z'),
    };
    mockRepository.create.mockReturnValue(savedClient);
    mockRepository.save.mockResolvedValue(savedClient);

    return request(app.getHttpServer())
      .post('/api/clients')
      .send({
        fullName: 'John Doe',
        cpf: '529.982.247-25',
        email: 'john@example.com',
        favoriteColor: 'blue',
        notes: 'First client',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.cpf).toBe('52998224725');
        expect(response.body.email).toBe('john@example.com');
      });
  });

  it('POST /api/clients should return 409 for duplicate CPF', async () => {
    mockRepository.create.mockImplementation((payload) => payload);

    const driverError = new Error('duplicate key') as Error & { code: string };
    driverError.code = '23505';
    const duplicateError = new QueryFailedError('INSERT', [], driverError);
    mockRepository.save.mockRejectedValueOnce(duplicateError);

    await request(app.getHttpServer())
      .post('/api/clients')
      .send({
        fullName: 'Outro Nome',
        cpf: '529.982.247-25',
        email: 'other@example.com',
        favoriteColor: 'red',
      })
      .expect(409)
      .expect((response) => {
        expect(response.body.message).toContain('already registered');
      });
  });

  it('POST /api/clients should return 400 for invalid payload', () => {
    return request(app.getHttpServer())
      .post('/api/clients')
      .send({
        fullName: 'John',
        cpf: 'invalid',
        email: 'not-an-email',
        favoriteColor: 'pink',
      })
      .expect(400);
  });
});
