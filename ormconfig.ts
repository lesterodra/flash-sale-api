import 'dotenv/config';
import { FlashSale } from 'src/flashSale/flashSale.entity';
import { Order } from 'src/order/order.entity';
import { Product } from 'src/product/product.entity';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  migrations: ['./migrations/*.ts'],
  entities: [Order, Product, FlashSale],
});
