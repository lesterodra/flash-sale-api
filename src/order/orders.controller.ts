import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import type { CreateOrder, QueueAddedResponse } from './order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  @Get()
  findAll(@Query('email') email: string) {
    return this.ordersService.findAllUserOrder(email);
  }

  @Post()
  async purchase(
    // TODO: Add body validation here.
    @Body() createOrderInput: CreateOrder,
  ): Promise<QueueAddedResponse> {
    const jobId = await this.ordersService.addToOrderQueue(createOrderInput);

    return { job_id: jobId, message: 'success' };
  }
}
