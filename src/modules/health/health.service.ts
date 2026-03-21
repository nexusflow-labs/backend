import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ICacheService } from '../../infrastructure/cache/cache.service';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  components: {
    database: ComponentStatus;
    cache: ComponentStatus;
  };
}

export interface ComponentStatus {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: ICacheService,
  ) {}

  async checkReadiness(): Promise<{ status: string; timestamp: string }> {
    const dbHealthy = await this.checkDatabase();

    if (!dbHealthy.status) {
      throw new ServiceUnavailableException({
        status: 'unhealthy',
        message: 'Database connection failed',
        error: dbHealthy.error,
      });
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async checkDetailed(): Promise<HealthCheckResult> {
    const [dbCheck, cacheCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
    ]);

    const components = {
      database: {
        status: dbCheck.status ? 'healthy' : 'unhealthy',
        latency: dbCheck.latency,
        ...(dbCheck.error && { error: dbCheck.error }),
      } as ComponentStatus,
      cache: {
        status: cacheCheck.status ? 'healthy' : 'unhealthy',
        latency: cacheCheck.latency,
        ...(cacheCheck.error && { error: cacheCheck.error }),
      } as ComponentStatus,
    };

    // Overall status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (!dbCheck.status) {
      status = 'unhealthy';
    } else if (!cacheCheck.status) {
      status = 'degraded'; // App can run without cache
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      components,
    };
  }

  private async checkDatabase(): Promise<{
    status: boolean;
    latency?: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      this.logger.error(`Database health check failed: ${error}`);
      return {
        status: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkCache(): Promise<{
    status: boolean;
    latency?: number;
    error?: string;
  }> {
    const start = Date.now();
    const testKey = '__health_check__';

    try {
      await this.cache.set(testKey, 'ok', 10);
      const value = await this.cache.get<string>(testKey);
      await this.cache.del(testKey);

      return {
        status: value === 'ok',
        latency: Date.now() - start,
      };
    } catch (error) {
      this.logger.warn(`Cache health check failed: ${error}`);
      return {
        status: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
