import { Injectable } from '@nestjs/common';
import { User as UserEntity } from '../../domain/entities/user.entitiy';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository extends IUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(user: UserEntity): Promise<void> {
    const data = UserMapper.toUserEntity(user);

    await this.prisma.user.upsert({
      where: { id: user.id || '' },
      update: data,
      create: data,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userRecord) return null;

    return UserMapper.toDomain(userRecord);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userRecord) return null;

    return UserMapper.toDomain(userRecord);
  }
}
