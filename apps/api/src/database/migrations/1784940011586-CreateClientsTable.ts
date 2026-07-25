import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateClientsTable1784940011586 implements MigrationInterface {
  name = 'CreateClientsTable1784940011586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.createTable(
      new Table({
        name: 'clients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'full_name',
            type: 'character varying',
            length: '255',
            isNullable: false,
          },
          {
            name: 'cpf',
            type: 'character varying',
            length: '11',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'email',
            type: 'character varying',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'favorite_color',
            type: 'character varying',
            length: '32',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clients');
  }
}
