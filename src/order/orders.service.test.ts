import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getQueueToken } from '@nestjs/bullmq';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { FlashSale } from 'src/flashSale/flashSale.entity';
import { Product } from 'src/product/product.entity';
import { ORDER_QUEUE_NAME } from 'src/constants';

const mockQueue = {
  add: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

const mockQueryBuilder = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({ affected: 1 }), // important
};

const mockManager = {
  save: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockFlashSaleRepository = { findOneByOrFail: jest.fn() };
const mockOrderRespository = { findOneByOrFail: jest.fn(), find: jest.fn() };
const mockProductRepository = { findOneByOrFail: jest.fn() };

mockDataSource.transaction.mockImplementation(async (cb) => {
  return cb(mockManager);
});

let orderService: OrdersService;

describe('Order Service', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,

        { provide: getQueueToken(ORDER_QUEUE_NAME), useValue: mockQueue },
        { provide: DataSource, useValue: mockDataSource },

        { provide: getRepositoryToken(Order), useValue: mockOrderRespository },
        {
          provide: getRepositoryToken(FlashSale),
          useValue: mockFlashSaleRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    orderService = module.get<OrdersService>(OrdersService);
  });

  describe('processFlashSaleOrder', () => {
    it('should process flash sale orders.', async () => {
      const mockOrderValue = {
        id: 1,
        email: 'user1@test.com',
        product_id: 1,
        status: 'PENDING',
        created_at: new Date('2026-04-30 12:40:14.864212'),
        updated_at: new Date('2026-04-30 12:40:15.024071'),
      };
      const mockProductValue = {
        id: 1,
        name: 'iphone 20',
      };
      const mockFlashSaleValue = {
        id: 1,
        product_id: 1,
        sale_quantity: 50,
        start_timestamp: new Date('2026-04-29 00:00:00+08'),
        end_timestamp: new Date('2026-05-01 00:00:00+08'),
      };

      mockOrderRespository.findOneByOrFail.mockResolvedValueOnce(
        mockOrderValue,
      );
      mockFlashSaleRepository.findOneByOrFail.mockResolvedValueOnce(
        mockFlashSaleValue,
      );
      mockProductRepository.findOneByOrFail.mockResolvedValueOnce(
        mockProductValue,
      );

      await orderService.processFlashSaleOrder({
        product_id: 1,
        email: 'user1@test.com',
        flash_sale_id: 1,
        order_id: 1,
      });

      expect(mockFlashSaleRepository.findOneByOrFail).toHaveBeenCalledTimes(1);
      expect(mockOrderRespository.findOneByOrFail).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.findOneByOrFail).toHaveBeenCalledTimes(1);
      expect(mockManager.update).toHaveBeenCalledTimes(2);
      expect(mockManager.createQueryBuilder).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllUserOrder', () => {
    it('should return order history based on user email', async () => {
      mockOrderRespository.find.mockResolvedValueOnce([]);

      const result = await orderService.findAllUserOrder('user1@test.com');

      expect(result).toEqual([]);
      expect(mockOrderRespository.find).toHaveBeenNthCalledWith(1, {
        relations: ['product'],
        where: { email: 'user1@test.com' },
      });
    });
  });
});
