import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { Client } from './clients/entities/client.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(configService.get<string>('DATABASE_PORT', '5434')),
        username: configService.get<string>('DATABASE_USER', 'dataform'),
        password: configService.get<string>('DATABASE_PASSWORD', 'dataform'),
        database: configService.get<string>('DATABASE_NAME', 'dataform'),
        entities: [Client],
        migrations: [join(__dirname, 'database', 'migrations', '*.{ts,js}')],
        migrationsRun: configService.get<string>('TYPEORM_MIGRATIONS_RUN', 'false') === 'true',
        synchronize: configService.get<string>('TYPEORM_SYNCHRONIZE', 'false') === 'true',
      }),
    }),
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
