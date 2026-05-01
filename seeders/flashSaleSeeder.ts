import { AppDataSource } from '../ormconfig';
import { FlashSale } from 'src/flashSale/flashSale.entity';
import { Order } from 'src/order/order.entity';
import { Product } from 'src/product/product.entity';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

/**
 * This seeder will initial sample data and will delete all exising data.
 */
async function seed() {
  try {
    await AppDataSource.initialize();

    const productRepository = AppDataSource.getRepository(Product);
    const flashSaleRepository = AppDataSource.getRepository(FlashSale);
    const orderRepository = AppDataSource.getRepository(Order);

    // First, delete all table data
    await orderRepository.deleteAll();
    await flashSaleRepository.deleteAll();
    await productRepository.deleteAll();

    // Re-insert data
    const product = await productRepository.save({
      name: 'Iphone 20',
      available_quantity: 100,
    });

    const currentDateMs = Date.now();
    await flashSaleRepository.save({
      product_id: product.id,
      sale_quantity: 90,
      start_timestamp: new Date(currentDateMs - ONE_HOUR),
      end_timestamp: new Date(currentDateMs + ONE_DAY),
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error(error);
  }
}

seed().catch((err) => {
  console.error('Seeder error', err);
});
