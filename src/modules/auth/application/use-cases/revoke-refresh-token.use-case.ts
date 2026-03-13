import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

@Injectable()
export class RevokeRefreshTokenUseCase {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  /**
   * Revoke a specific refresh token (logout from one device)
   */
  async execute(refreshToken: string): Promise<void> {
    const token = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.revokeByToken(refreshToken);
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  async executeAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }
}
