import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/presentation/decorators/public.decorator';
import { HealthService, HealthCheckResult } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Liveness probe - checks if the application is running
   * Used by Docker/Kubernetes to determine if the container should be restarted
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe - checks if the application is ready to serve traffic
   * Verifies database and cache connections
   */
  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async readiness() {
    return this.healthService.checkReadiness();
  }

  /**
   * Detailed health check with component status
   */
  @Get('detailed')
  @Public()
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  async detailed(): Promise<HealthCheckResult> {
    return this.healthService.checkDetailed();
  }
}
