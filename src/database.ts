import * as dotenv from 'dotenv';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import { FlashSale } from './flashSale/flashSale.entity';
import { Product } from './product/product.entity';
import { Order } from './order/order.entity';
dotenv.config();

export function databaseFactory() {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [FlashSale, Product, Order],
    synchronize: false,
    autoLoadEntities: true,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  } as PostgresConnectionCredentialsOptions;
}
