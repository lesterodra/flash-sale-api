import { FlashSale } from 'src/flashSale/flashSale.entity';
import { Order } from 'src/order/order.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column()
  available_quantity: number;

  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];

  @OneToMany(() => FlashSale, (flashSale) => flashSale.product)
  flashSales: FlashSale[];
}
