import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { ORDER_QUEUE_NAME } from 'src/constants';
import { FlashSale } from 'src/flashSale/flashSale.entity';
import { Product } from 'src/product/product.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ORDER_QUEUE_NAME,
    }),
    TypeOrmModule.forFeature([Order, FlashSale, Product]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
