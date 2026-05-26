import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

describe('ClientsController', () => {
  let controller: ClientsController;
  const mockClientsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
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
