import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { Client } from '../clients/entities/client.entity';

loadEnv({ path: join(__dirname, '..', '..', '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? '5434'),
  username: process.env.DATABASE_USER ?? 'dataform',
  password: process.env.DATABASE_PASSWORD ?? 'dataform',
  database: process.env.DATABASE_NAME ?? 'dataform',
  entities: [Client],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
