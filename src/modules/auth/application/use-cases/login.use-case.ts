import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { LoginDto } from '../../presentation/dtos/auth.request.dto';
import { PasswordHashingService } from '../services/password-hashing.service';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const isPasswordValid = await this.passwordHashingService.verify(
      user.password,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = randomBytes(64).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id!,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
