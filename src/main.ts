import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './infrastructure/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './infrastructure/common/filters/http-exception.filter';
import { RedisIoAdapter } from './infrastructure/redis-adapter/redis-io-adapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const redisIoAdapter = new RedisIoAdapter(app, configService);
  redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.enableShutdownHooks();

  // Graceful shutdown for Redis adapter
  const shutdown = async (signal: string) => {
    try {
      console.log(`Received ${signal}, shutting down...`);

      await redisIoAdapter.onApplicationShutdown(signal);
      await app.close();
    } catch (err) {
      console.error('Shutdown error', err);
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
