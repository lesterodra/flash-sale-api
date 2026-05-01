import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ORDER_QUEUE_NAME } from 'src/constants';
import { JobProcessor } from './job.processor';
import { OrdersModule } from 'src/order/orders.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ORDER_QUEUE_NAME,
    }),
    OrdersModule,
  ],
  providers: [JobProcessor],
})
export class JobsModule {}
