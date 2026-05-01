import { Module } from '@nestjs/common';
import { FlashSalesController } from './flashSales.controller';
import { FlashSalesService } from './flashSales.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashSale } from './flashSale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlashSale])],
  controllers: [FlashSalesController],
  providers: [FlashSalesService],
})
export class FlashSalesModule {}
