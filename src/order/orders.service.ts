import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Order, OrderStatus } from './order.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CreateOrder } from './order.dto';
import { ORDER_QUEUE_NAME } from 'src/constants';
import { FlashSale, FlashSaleStatus } from 'src/flashSale/flashSale.entity';
import { Product } from 'src/product/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectQueue(ORDER_QUEUE_NAME) private orderQueue: Queue,
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(FlashSale)
    private flashSaleRepository: Repository<FlashSale>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  public async addToOrderQueue(
    input: CreateOrder,
  ): Promise<string | undefined> {
    const flashSale = await this.flashSaleRepository.findOneOrFail({
      where: { id: input.flash_sale_id },
      relations: ['product'],
    });

    if (flashSale.status === FlashSaleStatus.ENDED) {
      throw new BadRequestException('Flash sale is already ended.');
    }

    // User can only buy 1 product
    const existingOrderCount = await this.orderRepository.countBy({
      email: input.email,
      status: In([OrderStatus.PENDING, OrderStatus.PROCESSED]),
    });

    if (existingOrderCount) {
      throw new BadRequestException('You can only order 1');
    }

    // Initial check before sending the job to the queue
    if (flashSale.sale_quantity < 1) {
      throw new BadRequestException('Product is out of stock');
    }

    if (!flashSale.product) {
      throw new InternalServerErrorException('Invalid data.');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.save(Order, {
        product_id: input.product_id,
        email: input.email,
        status: OrderStatus.PENDING,
      });

      await queryRunner.commitTransaction();

      const job = await this.orderQueue.add(
        'flash-sale',
        { ...input, order_id: order.id },
        // This will ensure to handle 1 job per user + product at a time
        { jobId: `${input.email}-${input.product_id}-${input.flash_sale_id}` },
      );

      return job.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async processFlashSaleOrder(
    input: CreateOrder & { order_id: number },
  ): Promise<void> {
    console.log('start processing order', input);

    try {
      const order = await this.orderRepository.findOneByOrFail({
        id: input.order_id,
      });
      const product = await this.productRepository.findOneByOrFail({
        id: input.product_id,
      });
      const flashSale = await this.flashSaleRepository.findOneByOrFail({
        id: input.flash_sale_id,
      });

      await this.dataSource.transaction(async (manager) => {
        // incase the sale quantity is already sold out at the time of processing, update the order status to FAILED.
        if (flashSale.sale_quantity < 1) {
          await manager.update(
            Order,
            { id: order.id },
            { status: OrderStatus.FAILED },
          );

          return;
        }

        // Decrement flash sale quantity by 1
        // Only update if the quantity is still > 0
        const flashSaleUpdate = await manager
          .createQueryBuilder()
          .update(FlashSale)
          .set({
            sale_quantity: () => 'sale_quantity - 1',
          })
          .where('id = :id', { id: flashSale.id })
          .andWhere('sale_quantity > 0')
          .execute();

        // handle the case where the quantity is already zero when we excute the query
        if (flashSaleUpdate.affected === 0) {
          await manager.update(
            Order,
            { id: order.id },
            { status: OrderStatus.FAILED },
          );

          return;
        }

        // Decrement product quantity by 1
        const productUpdate = manager.update(
          Product,
          { id: product.id },
          { available_quantity: product.available_quantity - 1 },
        );

        // Update order status to Processed
        const orderUpdate = manager.update(
          Order,
          { id: order.id },
          { status: OrderStatus.PROCESSED },
        );

        const [_orderResult, _productResult] = await Promise.all([
          orderUpdate,
          productUpdate,
        ]);
      });
    } catch (error) {
      console.error(error);
    }
  }

  public findAllUserOrder(email: string): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['product'],
      where: { email },
    });
  }
}
