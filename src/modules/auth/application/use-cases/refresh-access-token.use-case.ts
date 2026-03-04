import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { IUserRepository } from '../../domain/repositories/user.repository';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const token = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!token.isValid()) {
      throw new UnauthorizedException('Refresh token is expired or revoked');
    }

    const user = await this.userRepository.findById(token.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke the old token (token rotation)
    await this.refreshTokenRepository.revokeByToken(refreshToken);

    // Create new tokens
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const newAccessToken = await this.jwtService.signAsync(payload);
    const newRefreshToken = randomBytes(64).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.refreshTokenRepository.create({
      token: newRefreshToken,
      userId: user.id!,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
