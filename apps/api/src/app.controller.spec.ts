import { Test, type TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return API info at root', () => {
    expect(appController.getRoot()).toEqual({
      name: 'data-form-api',
      health: '/api/health',
      clients: 'POST /api/clients',
    });
  });

  it('should return health status', () => {
    expect(appController.getHealth()).toEqual({ status: 'ok' });
  });
});
