import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICacheService } from './cache.service';
import { RedisCacheService } from './redis-cache.service';
import { MemoryCacheService } from './memory-cache.service';

@Global()
@Module({
  providers: [
    {
      provide: ICacheService,
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheModule');
        const redisUrl = configService.get<string>('REDIS_URL');

        // If no Redis URL is configured, use memory cache
        if (!redisUrl) {
          logger.warn('REDIS_URL not configured, using in-memory cache');
          return new MemoryCacheService(configService);
        }

        // Try to connect to Redis
        const redisService = new RedisCacheService(configService);

        try {
          const isHealthy = await redisService.isHealthy();
          if (isHealthy) {
            logger.log('Redis cache initialized successfully');
            return redisService;
          }
        } catch (error) {
          logger.warn(
            `Redis connection failed: ${error}. Falling back to in-memory cache.`,
          );
        }

        // Fallback to memory cache
        logger.warn('Falling back to in-memory cache');
        return new MemoryCacheService(configService);
      },
      inject: [ConfigService],
    },
    RedisCacheService,
    MemoryCacheService,
  ],
  exports: [ICacheService],
})
export class CacheModule implements OnModuleInit {
  private readonly logger = new Logger(CacheModule.name);

  constructor(private readonly cacheService: ICacheService) {}

  onModuleInit() {
    this.logger.log(
      `Cache service initialized: ${this.cacheService.constructor.name}`,
    );
  }
}
