import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateOrdersTable1777454445287 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('orders', [
      new TableColumn({ name: 'status', type: 'varchar', isNullable: true }),
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'now()',
      }),
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('orders', [
      'status',
      'created_at',
      'updated_at',
    ]);
  }
}
