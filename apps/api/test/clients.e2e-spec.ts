import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import request from 'supertest'
import { App } from 'supertest/types'
import { ClientsModule } from '../src/clients/clients.module'
import { Client } from '../src/clients/entities/client.entity'

describe('Clients (e2e)', () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Client],
          synchronize: true,
        }),
        ClientsModule,
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
        expect(response.body.id).toBeDefined()
        expect(response.body.cpf).toBe('52998224725')
        expect(response.body.email).toBe('john@example.com')
      })
  })

  it('POST /api/clients should return 409 for duplicate CPF', async () => {
    const payload = {
      fullName: 'John Doe',
      cpf: '52998224725',
      email: 'john@example.com',
      favoriteColor: 'blue',
    }
    await request(app.getHttpServer()).post('/api/clients').send(payload).expect(201)
    await request(app.getHttpServer())
      .post('/api/clients')
      .send({ ...payload, email: 'other@example.com' })
      .expect(409)
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
