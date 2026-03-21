import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor() {
    const pool: Pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Soft delete a record by setting deletedAt
  softDelete(model: 'workspace' | 'project' | 'task', id: string) {
    return (this[model] as any).update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Restore a soft-deleted record
  restore(model: 'workspace' | 'project' | 'task', id: string) {
    return (this[model] as any).update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
