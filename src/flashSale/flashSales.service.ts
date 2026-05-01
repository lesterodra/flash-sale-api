import { Injectable } from '@nestjs/common';
import { FlashSale } from './flashSale.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FlashSalesService {
  constructor(
    @InjectRepository(FlashSale)
    private flashSaleRepository: Repository<FlashSale>,
  ) {}

  public async findAllFlashSales(): Promise<FlashSale[]> {
    const flashSales = await this.flashSaleRepository.find({
      relations: ['product'],
    });

    return flashSales.map((flashSale) => ({
      ...flashSale,
      status: flashSale.status,
    }));
  }
}
