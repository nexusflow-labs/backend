import { RefreshToken } from '../entities/refresh-token.entity';

export interface CreateRefreshTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
}

export abstract class IRefreshTokenRepository {
  abstract create(data: CreateRefreshTokenData): Promise<RefreshToken>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract revokeByToken(token: string): Promise<void>;
  abstract revokeAllByUserId(userId: string): Promise<void>;
  abstract deleteExpired(): Promise<number>;
}
