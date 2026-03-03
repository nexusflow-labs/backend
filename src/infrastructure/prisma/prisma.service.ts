import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
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
