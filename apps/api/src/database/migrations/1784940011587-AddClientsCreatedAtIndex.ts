import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientsCreatedAtIndex1784940011587 implements MigrationInterface {
  name = 'AddClientsCreatedAtIndex1784940011587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE INDEX "IDX_clients_created_at" ON "clients" ("created_at")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_clients_created_at"');
  }
}
