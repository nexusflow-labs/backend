import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICacheService } from './cache.service';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class MemoryCacheService implements ICacheService {
  private readonly logger = new Logger(MemoryCacheService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtl: number;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private readonly configService: ConfigService) {
    this.defaultTtl = this.configService.get<number>('CACHE_TTL_DEFAULT', 300);

    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);

    this.logger.warn(
      'Using in-memory cache fallback. This is not recommended for production.',
    );
  }
  get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return Promise.resolve(null);
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return Promise.resolve(null);
    }

    return Promise.resolve(entry.value);
  }

  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, { value, expiresAt });
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.cache.delete(key);
    return Promise.resolve();
  }

  delByPattern(pattern: string): Promise<void> {
    // Convert glob pattern to regex
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    );

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
    return Promise.resolve();
  }

  has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return Promise.resolve(false);
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  clear(): Promise<void> {
    this.cache.clear();
    return Promise.resolve();
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }
}
