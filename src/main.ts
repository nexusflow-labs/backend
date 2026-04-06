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

  if (process.env.NODE_ENV === 'development') {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('NexusFlow API')
      .setDescription(
        'NexusFlow - Project Management & Enterprise Operations Platform API',
      )
      .setVersion('0.0.1')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Workspaces', 'Workspace management')
      .addTag('Members', 'Workspace membership management')
      .addTag('Invitations', 'Workspace invitation management')
      .addTag('Projects', 'Project management')
      .addTag('Tasks', 'Task management')
      .addTag('Comments', 'Task comments')
      .addTag('Labels', 'Label management')
      .addTag('Task Labels', 'Task-label associations')
      .addTag('Files', 'File upload and management')
      .addTag('Notifications', 'In-app notifications')
      .addTag('Activity Logs', 'Audit logging')
      .addTag('Dashboard', 'Workspace statistics')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

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

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

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

  const fontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:4200',
  );

  console.log(fontendUrl);

  app.enableCors({
    origin: [fontendUrl],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
