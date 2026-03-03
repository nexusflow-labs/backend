/**
 * Abstract cache service interface
 */
export abstract class ICacheService {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  abstract del(key: string): Promise<void>;
  abstract delByPattern(pattern: string): Promise<void>;
  abstract has(key: string): Promise<boolean>;
  abstract clear(): Promise<void>;
}
