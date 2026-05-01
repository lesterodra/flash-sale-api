import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getQueueToken } from '@nestjs/bullmq';
import { ORDER_QUEUE_NAME } from 'src/constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlashSale } from 'src/flashSale/flashSale.entity';
import { Order } from 'src/order/order.entity';

const mockQueue = {
  add: jest.fn(),
  process: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  close: jest.fn(),
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  countBy: jest.fn(),
};

const mockFlashSaleRepository = { ...mockRepository };
const mockOrderRespository = { ...mockRepository };

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    })
      // mock queue
      .overrideProvider(getQueueToken(ORDER_QUEUE_NAME))
      .useValue(mockQueue)
      // mock repositories
      .overrideProvider(getRepositoryToken(FlashSale))
      .useValue(mockFlashSaleRepository)
      .overrideProvider(getRepositoryToken(Order))
      .useValue(mockOrderRespository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/flash-sales (GET) - will get all available flash-sales in the DB. ', async () => {
    const mockValue = [
      {
        id: 1,
        product_id: 1,
        sale_quantity: 7,
        start_timestamp: '2026-04-28T16:00:00.000Z',
        end_timestamp: '2026-04-30T16:00:00.000Z',
        product: { id: 1, name: 'iphone 20', available_quantity: 17 },
        status: 'ACTIVE',
      },
    ];
    mockFlashSaleRepository.find.mockResolvedValueOnce(mockValue);

    await request(app.getHttpServer())
      .get('/flash-sales')
      .expect(200)
      .expect(mockValue);

    expect(mockFlashSaleRepository.find).toHaveBeenCalledTimes(1);
  });

  it('/orders (POST) - will create order request for the specific item and user.', async () => {
    const mockFlashSaleValue = {
      id: 1,
      product_id: 1,
      sale_quantity: 7,
      start_timestamp: '2026-04-28T16:00:00.000Z',
      end_timestamp: '2026-04-30T16:00:00.000Z',
      product: { id: 1, name: 'iphone 20', available_quantity: 17 },
      status: 'ACTIVE',
    };
    mockFlashSaleRepository.findOneOrFail.mockResolvedValueOnce(
      mockFlashSaleValue,
    );
    mockQueue.add.mockResolvedValue({ id: 'sample@sample.com-1-1' });
    mockOrderRespository.countBy.mockResolvedValueOnce(0);
    mockOrderRespository.save.mockResolvedValueOnce({ id: 1 });

    await request(app.getHttpServer())
      .post('/orders')
      .send({
        email: 'sample@sample.com',
        product_id: 1,
        flash_sale_id: 1,
      })
      .expect(201)
      .expect({ job_id: 'sample@sample.com-1-1', message: 'success' });

    expect(mockFlashSaleRepository.find).toHaveBeenCalledTimes(1);
    expect(mockQueue.add).toHaveBeenNthCalledWith(
      1,
      'flash-sale',
      expect.objectContaining({
        email: 'sample@sample.com',
        flash_sale_id: 1,
        product_id: 1,
      }),
      { jobId: 'sample@sample.com-1-1' },
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
