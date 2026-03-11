import { Global, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IQueueService } from './interfaces/queue.interface';
import { BullMQQueueService } from './services/bullmq-queue.service';
import { SyncQueueService } from './services/sync-queue.service';
import { ProcessorRegistry } from './services/processor-registry.service';

/**
 * Quick Redis connectivity check before creating BullMQ service
 * This prevents creating workers that will spam errors
 */
async function isRedisReachable(redisUrl: string): Promise<boolean> {
  const logger = new Logger('QueueModule');
  try {
    const url = new URL(redisUrl);
    const client = new Redis({
      host: url.hostname,
      port: parseInt(url.port, 10) || 6379,
      password: url.password || undefined,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    // Suppress error events during check
    client.on('error', () => {});

    await client.connect();
    const pong = await client.ping();
    await client.quit();

    return pong === 'PONG';
  } catch (error) {
    logger.warn(
      `Redis check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return false;
  }
}

@Global()
@Module({
  providers: [
    // ProcessorRegistry is the central place for processors to register themselves
    ProcessorRegistry,
    {
      provide: IQueueService,
      useFactory: async (
        configService: ConfigService,
        registry: ProcessorRegistry,
      ): Promise<IQueueService> => {
        const logger = new Logger('QueueModule');
        const queueEnabled = configService.get<string>('QUEUE_ENABLED', 'true');

        // If queue is explicitly disabled, use sync
        if (queueEnabled === 'false') {
          logger.warn(
            'Queue disabled via QUEUE_ENABLED=false, using synchronous execution',
          );
          return new SyncQueueService(registry);
        }

        const redisUrl = configService.get<string>('REDIS_URL');

        // If no Redis URL, use sync
        if (!redisUrl) {
          logger.warn('REDIS_URL not configured, using synchronous execution');
          return new SyncQueueService(registry);
        }

        // Check Redis connectivity BEFORE creating BullMQ service
        // This prevents workers from being created and spamming errors
        const reachable = await isRedisReachable(redisUrl);
        if (!reachable) {
          logger.warn('Redis not reachable, using synchronous execution');
          return new SyncQueueService(registry);
        }

        try {
          const service = new BullMQQueueService(configService, registry);
          logger.log('BullMQ queue service initialized');
          return service;
        } catch (error) {
          logger.warn(
            `BullMQ init failed: ${error instanceof Error ? error.message : 'Unknown error'}, falling back to sync`,
          );
          return new SyncQueueService(registry);
        }
      },
      inject: [ConfigService, ProcessorRegistry],
    },
  ],
  exports: [IQueueService, ProcessorRegistry],
})
export class QueueModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(QueueModule.name);

  constructor(
    private readonly queueService: IQueueService,
    private readonly registry: ProcessorRegistry,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const processorCount = this.registry.count;
    const registeredTypes = this.registry.getRegisteredTypes();

    this.logger.log(
      `${processorCount} job processor(s) registered: [${registeredTypes.join(', ')}]`,
    );

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
