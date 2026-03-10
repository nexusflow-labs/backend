import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IPasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { IEmailService } from 'src/infrastructure/email/interfaces/email.interface';

export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly emailService: IEmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`,
      );
      return;
    }

    if (!user.isActive) {
      this.logger.warn(`Password reset requested for inactive user: ${email}`);
      return;
    }

    const userId = user.id;
    if (!userId) {
      this.logger.error(`User ID is undefined for email: ${email}`);
      return;
    }

    await this.passwordResetTokenRepository.revokeAllByUserId(userId);

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.passwordResetTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.emailService.sendPasswordReset(email, {
        userName: user.name,
        resetLink,
        expiresAt,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
        error.stack,
      );
    }
  }
}
