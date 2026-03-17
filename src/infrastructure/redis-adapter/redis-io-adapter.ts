import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { INestApplicationContext } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private pubClient: Redis;
  private subClient: Redis;

  constructor(
    app: INestApplicationContext,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  connectToRedis() {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    this.pubClient = new Redis(redisUrl);
    this.subClient = this.pubClient.duplicate();

    this.pubClient.on('error', (err) => {
      console.error('Redis pubClient error:', err);
    });

    this.subClient.on('error', (err) => {
      console.error('Redis subClient error:', err);
    });

    this.pubClient.on('connect', () => {
      console.log('Redis pubClient connected');
    });

    this.subClient.on('connect', () => {
      console.log('Redis subClient connected');
    });

    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
  }

  async onApplicationShutdown(signal?: string) {
    console.log('Shutting down Redis adapter...', signal);

    await Promise.all([this.pubClient?.quit(), this.subClient?.quit()]);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
