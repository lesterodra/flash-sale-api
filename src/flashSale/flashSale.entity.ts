import { Product } from 'src/product/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum FlashSaleStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

@Entity('flash_sales')
export class FlashSale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column()
  sale_quantity: number;

  @Column()
  start_timestamp: Date;

  @Column()
  end_timestamp: Date;

  @ManyToOne(() => Product, (product) => product.flashSales)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  get status(): FlashSaleStatus {
    const currentDate = new Date();
    if (
      currentDate >= this.start_timestamp &&
      currentDate <= this.end_timestamp
    ) {
      return FlashSaleStatus.ACTIVE;
    } else if (currentDate > this.end_timestamp) {
      return FlashSaleStatus.ENDED;
    }
    return FlashSaleStatus.UPCOMING;
  }
}
