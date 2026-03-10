import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface CreatePasswordResetTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
}

export abstract class IPasswordResetTokenRepository {
  abstract create(
    data: CreatePasswordResetTokenData,
  ): Promise<PasswordResetToken>;
  abstract findByToken(token: string): Promise<PasswordResetToken | null>;
  abstract markAsUsed(token: string): Promise<void>;
  abstract revokeAllByUserId(userId: string): Promise<void>;
  abstract deleteExpired(): Promise<number>;
}
