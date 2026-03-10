import { PasswordResetToken as PrismaPasswordResetToken } from 'generated/prisma/client';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

export class PasswordResetTokenMapper {
  static toDomain(raw: PrismaPasswordResetToken): PasswordResetToken {
    return PasswordResetToken.reconstitute({
      id: raw.id,
      token: raw.token,
      userId: raw.userId,
      expiresAt: raw.expiresAt,
      usedAt: raw.usedAt ?? undefined,
      createdAt: raw.createdAt,
    });
  }
}
