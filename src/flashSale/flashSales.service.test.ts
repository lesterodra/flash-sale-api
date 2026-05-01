import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlashSale } from 'src/flashSale/flashSale.entity';
import { FlashSalesService } from './flashSales.service';

const mockFlashSaleRepository = { find: jest.fn() };
let flashSaleService: FlashSalesService;

describe('Flash Sale Service', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashSalesService,
        {
          provide: getRepositoryToken(FlashSale),
          useValue: mockFlashSaleRepository,
        },
      ],
    }).compile();

    flashSaleService = module.get<FlashSalesService>(FlashSalesService);
  });

  describe('findAllFlashSales', () => {
    it('should get flash sale product with status.', async () => {
      const mockValue = [
        {
          id: 1,
          product_id: 1,
          sale_quantity: 50,
          start_timestamp: new Date('2026-04-29 00:00:00+08'),
          end_timestamp: new Date('2026-05-01 00:00:00+08'),
        },
      ];
      mockFlashSaleRepository.find.mockResolvedValueOnce(mockValue);

      const result = await flashSaleService.findAllFlashSales();

      expect(result).toEqual(mockValue);
      expect(mockFlashSaleRepository.find).toHaveBeenCalledTimes(1);
    });
  });
});
