import { RefreshToken as PrismaRefreshToken } from 'generated/prisma/client';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export class RefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): RefreshToken {
    return RefreshToken.reconstitute({
      id: raw.id,
      token: raw.token,
      userId: raw.userId,
      expiresAt: raw.expiresAt,
      revokedAt: raw.revokedAt ?? undefined,
      createdAt: raw.createdAt,
    });
  }
}
