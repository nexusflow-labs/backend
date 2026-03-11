import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import {
  CreatePasswordResetTokenData,
  IPasswordResetTokenRepository,
} from '../../domain/repositories/password-reset-token.repository';
import { PasswordResetTokenMapper } from '../mappers/password-reset-token.mapper';

@Injectable()
export class PrismaPasswordResetTokenRepository extends IPasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    data: CreatePasswordResetTokenData,
  ): Promise<PasswordResetToken> {
    const record = await this.prisma.passwordResetToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });

    return PasswordResetTokenMapper.toDomain(record);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) return null;

    return PasswordResetTokenMapper.toDomain(record);
  }

  async markAsUsed(token: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }
}
