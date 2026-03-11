import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ICacheService } from './cache.service';

@Injectable()
export class RedisCacheService implements ICacheService, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly redis: Redis;
  private readonly defaultTtl: number;
  private connectionFailed = false;
  private errorLogged = false;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    this.defaultTtl = this.configService.get<number>('CACHE_TTL_DEFAULT', 300);

    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          this.connectionFailed = true;
          // Return null to stop retrying
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      // Don't reconnect automatically after connection is closed
      reconnectOnError: () => false,
      // Don't enable offline queue - fail fast if not connected
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    // Only log the first error to avoid spam
    this.redis.on('error', (err) => {
      if (!this.errorLogged) {
        this.logger.error(`Redis connection error: ${err.message}`);
        this.errorLogged = true;
      }
      this.connectionFailed = true;
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
      this.connectionFailed = false;
      this.errorLogged = false;
    });

    this.redis.on('close', () => {
      if (!this.connectionFailed) {
        this.logger.debug('Redis connection closed');
      }
    });
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
    } catch {
      // Ignore errors on shutdown
    }
  }

  /**
   * Disconnect and cleanup Redis connection
   * Call this when falling back to memory cache
   */
  disconnect(): void {
    try {
      this.redis.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.connectionFailed) return null;

    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}: ${error}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (this.connectionFailed) return;

    try {
      const ttl = ttlSeconds ?? this.defaultTtl;
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}: ${error}`);
    }
  }

  async del(key: string): Promise<void> {
    if (this.connectionFailed) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}: ${error}`);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    if (this.connectionFailed) return;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Redis DEL by pattern error: ${error}`);
    }
  }

  async has(key: string): Promise<boolean> {
    if (this.connectionFailed) return false;

    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}: ${error}`);
      return false;
    }
  }

  async clear(): Promise<void> {
    if (this.connectionFailed) return;

    try {
      await this.redis.flushdb();
    } catch (error) {
      this.logger.error(`Redis FLUSHDB error: ${error}`);
    }
  }

  /**
   * Check if Redis is connected and healthy
   */
  async isHealthy(): Promise<boolean> {
    if (this.connectionFailed) return false;

    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
