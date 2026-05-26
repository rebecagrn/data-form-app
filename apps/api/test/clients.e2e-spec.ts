import { ConflictException, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { QueryFailedError } from 'typeorm'
import request from 'supertest'
import { App } from 'supertest/types'
import { ClientsController } from '../src/clients/clients.controller'
import { ClientsService } from '../src/clients/clients.service'
import { Client } from '../src/clients/entities/client.entity'

describe('Clients (e2e)', () => {
  let app: INestApplication<App>
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    mockRepository.create.mockReset()
    mockRepository.save.mockReset()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )
    await app.init()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  it('POST /api/clients should create a client', () => {
    const savedClient: Client = {
      id: 'uuid-1',
      fullName: 'John Doe',
      cpf: '52998224725',
      email: 'john@example.com',
      favoriteColor: 'blue',
      notes: 'First client',
      createdAt: new Date('2026-05-26T00:00:00.000Z'),
    }
    mockRepository.create.mockReturnValue(savedClient)
    mockRepository.save.mockResolvedValue(savedClient)

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
        expect(response.body.cpf).toBe('52998224725')
        expect(response.body.email).toBe('john@example.com')
      })
  })

  it('POST /api/clients should return 409 for duplicate CPF', async () => {
    mockRepository.create.mockImplementation((payload) => payload)

    const duplicateError = new QueryFailedError(
      'INSERT',
      [],
      new Error('duplicate key'),
    )
    ;(duplicateError as QueryFailedError & { driverError: { code: string } })
      .driverError = { code: '23505' }
    mockRepository.save.mockRejectedValueOnce(duplicateError)

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
        expect(response.body.message).toContain('already registered')
      })
  })

  it('POST /api/clients should return 400 for invalid payload', () => {
    return request(app.getHttpServer())
      .post('/api/clients')
      .send({
        fullName: 'John',
        cpf: 'invalid',
        email: 'not-an-email',
        favoriteColor: 'pink',
      })
      .expect(400)
  })
})
