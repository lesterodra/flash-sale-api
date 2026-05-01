import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ORDER_QUEUE_NAME } from 'src/constants';
import { OrdersService } from 'src/order/orders.service';

// Set concurrency = 1 to handle over selling of quantity.
// This will prevent race condition, however we it will affect the performance due to slow processing of orders.
@Processor(ORDER_QUEUE_NAME, {
  concurrency: 1,
  removeOnComplete: { age: 0 },
  removeOnFail: { age: 0 },
})
export class JobProcessor extends WorkerHost {
  constructor(private orderService: OrdersService) {
    super();
  }

  async process(job: Job) {
    console.log('job received: ', job.id);

    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const { name, data } = job;
    switch (name) {
      case 'flash-sale':
        await this.orderService.processFlashSaleOrder(data);
        break;
      // Implement other job types here
      default:
        break;
    }
  }
}
