import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IQueueService } from './interfaces/queue.interface';
import {
  IJobProcessor,
  JOB_PROCESSOR,
} from './interfaces/job-processor.interface';
import { BullMQQueueService } from './services/bullmq-queue.service';
import { SyncQueueService } from './services/sync-queue.service';

async function checkRedisConnection(redisUrl: string): Promise<boolean> {
  const logger = new Logger('QueueModule');
  try {
    const url = new URL(redisUrl);
    const client = new Redis({
      host: url.hostname,
      port: parseInt(url.port, 10) || 6379,
      password: url.password || undefined,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    await client.connect();
    const pong = await client.ping();
    await client.quit();

    return pong === 'PONG';
  } catch (error) {
    logger.warn(
      `Redis connection check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return false;
  }
}

@Global()
@Module({
  providers: [
    {
      provide: IQueueService,
      useFactory: async (
        configService: ConfigService,
        processors: IJobProcessor[],
      ): Promise<IQueueService> => {
        const logger = new Logger('QueueModule');
        const queueEnabled = configService.get<string>('QUEUE_ENABLED', 'true');

        // If queue is explicitly disabled, use sync
        if (queueEnabled === 'false') {
          logger.warn(
            'Queue disabled via QUEUE_ENABLED=false, using synchronous execution',
          );
          return new SyncQueueService(processors);
        }

        const redisUrl = configService.get<string>('REDIS_URL');

        // If no Redis URL, use sync
        if (!redisUrl) {
          logger.warn('REDIS_URL not configured, using synchronous execution');
          return new SyncQueueService(processors);
        }

        const isRedisReachable = await checkRedisConnection(redisUrl);
        if (isRedisReachable) {
          logger.log('BullMQ queue initialized successfully');
          try {
            const service = new BullMQQueueService(configService, processors);
            await service.isHealthy(); // Verify thực sự kết nối được
            return service;
          } catch {
            logger.warn('BullMQ init failed, falling back to sync');
            return new SyncQueueService(processors);
          }
        }

        logger.warn(
          'Redis not reachable, falling back to synchronous execution',
        );
        return new SyncQueueService(processors);
      },
      inject: [ConfigService, JOB_PROCESSOR],
    },
  ],
  exports: [IQueueService],
})
export class QueueModule implements OnModuleInit {
  private readonly logger = new Logger(QueueModule.name);

  constructor(private readonly queueService: IQueueService) {}

  async onModuleInit(): Promise<void> {
    const isHealthy = await this.queueService.isHealthy();
    const serviceType =
      this.queueService instanceof BullMQQueueService
        ? 'BullMQ'
        : 'Synchronous';

    if (isHealthy) {
      this.logger.log(`Queue service (${serviceType}) is healthy`);
    } else {
      this.logger.warn(`Queue service (${serviceType}) health check failed`);
    }
  }
}
