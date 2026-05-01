import { Controller, Get } from '@nestjs/common';
import { FlashSalesService } from './flashSales.service';
import { FlashSale } from './flashSale.entity';

@Controller('flash-sales')
export class FlashSalesController {
  constructor(private flashSalesService: FlashSalesService) {}

  @Get()
  getAll(): Promise<FlashSale[]> {
    return this.flashSalesService.findAllFlashSales();
  }
}
