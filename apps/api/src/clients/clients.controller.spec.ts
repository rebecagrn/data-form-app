import { Test, type TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import type { CreateClientDto } from './dto/create-client.dto';

describe('ClientsController', () => {
  let controller: ClientsController;
  const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    mockClientsService.create.mockReset();
    mockClientsService.findAll.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();
    controller = module.get<ClientsController>(ClientsController);
  });

  it('should delegate client listing to the service', async () => {
    const expectedResponse = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    };
    mockClientsService.findAll.mockResolvedValue(expectedResponse);
    const actual = await controller.findAll({ page: 1, limit: 20 });
    expect(mockClientsService.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(actual).toEqual(expectedResponse);
  });

  it('should delegate client creation to the service', async () => {
    const inputDto: CreateClientDto = {
      fullName: 'Jane Doe',
      cpf: '52998224725',
      email: 'jane@example.com',
      favoriteColor: 'green',
    };
    const expectedResponse = {
      id: 'uuid-2',
      ...inputDto,
      notes: null,
      createdAt: new Date(),
    };
    mockClientsService.create.mockResolvedValue(expectedResponse);
    const actual = await controller.create(inputDto);
    expect(mockClientsService.create).toHaveBeenCalledWith(inputDto);
    expect(actual).toEqual(expectedResponse);
  });
});
