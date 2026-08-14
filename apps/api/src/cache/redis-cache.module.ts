import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        stores: [
          createKeyv(configService.get<string>('REDIS_URL', 'redis://localhost:6379'), {
            namespace: 'data-form',
          }),
        ],
      }),
    }),
  ],
})
export class RedisCacheModule {}
