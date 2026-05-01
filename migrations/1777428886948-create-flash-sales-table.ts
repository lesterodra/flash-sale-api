import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFlashSalesTable1777428886948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'flash_sales',
        columns: [
          {
            name: 'id',
            type: 'int',
            isGenerated: true,
            isPrimary: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'sale_quantity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'start_timestamp',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'end_timestamp',
            type: 'timestamptz',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'flash_sales',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('flash_sales');
  }
}
