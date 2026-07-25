import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { Client } from '../clients/entities/client.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER ?? 'dataform',
  password: process.env.DATABASE_PASSWORD ?? 'dataform',
  database: process.env.DATABASE_NAME ?? 'dataform',
  entities: [Client],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
