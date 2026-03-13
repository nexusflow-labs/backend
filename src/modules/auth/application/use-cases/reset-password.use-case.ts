import { BadRequestException, Logger, Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IPasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { PasswordHashingService } from '../services/password-hashing.service';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordResetTokenRepository)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const resetToken = await this.passwordResetTokenRepository.findByToken(
      input.token,
    );

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!resetToken.isValid()) {
      if (resetToken.isExpired()) {
        throw new BadRequestException('Reset token has expired');
      }
      if (resetToken.isUsed()) {
        throw new BadRequestException('Reset token has already been used');
      }
      throw new BadRequestException('Invalid reset token');
    }

    const user = await this.userRepository.findById(resetToken.userId);

    if (!user || !user.id) {
      throw new BadRequestException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('User account is inactive');
    }

    const hashedPassword = await this.passwordHashingService.hash(
      input.newPassword,
    );
    user.updatePassword(hashedPassword);
    await this.userRepository.save(user);

    await this.passwordResetTokenRepository.markAsUsed(input.token);

    await this.refreshTokenRepository.revokeAllByUserId(user.id);

    this.logger.log(`Password reset successful for user: ${user.email}`);
  }
}
