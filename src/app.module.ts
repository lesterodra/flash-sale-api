import { Module } from '@nestjs/common';
import { FlashSalesModule } from './flashSale/flashSales.module';
import { OrdersModule } from './order/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseFactory } from './database';
import { BullModule } from '@nestjs/bullmq';

const isTest = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseFactory,
      inject: [ConfigService],
    }),
    ...(!isTest
      ? [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (_configService: ConfigService) => ({
              connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT
                  ? Number(process.env.REDIS_PORT)
                  : 6379,
              },
            }),
            inject: [ConfigService],
          }),
        ]
      : []),
    FlashSalesModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
