import { Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';

/**
 * Environment file loading order (first found wins):
 * 1. .env.{NODE_ENV}.local - Local overrides for specific environment
 * 2. .env.{NODE_ENV}       - Environment-specific settings
 * 3. .env.local            - Local development overrides
 * 4. .env                   - Default/shared settings
 *
 * Usage:
 * - Development: NODE_ENV=development (uses .env.local)
 * - Staging:     NODE_ENV=staging (uses .env.staging)
 * - Production:  NODE_ENV=production (uses .env.production)
 */
function getEnvFilePaths(): string[] {
  const nodeEnv = process.env.NODE_ENV || 'development';

  return [
    `.env.${nodeEnv}.local`, // Highest priority: local overrides for env
    `.env.${nodeEnv}`, // Environment-specific
    '.env.local', // Local development
    '.env', // Default fallback
  ];
}

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths(),
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
