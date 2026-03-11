import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IPasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { IQueueService } from 'src/infrastructure/queue/interfaces/queue.interface';
import { JobType, JobPriority } from 'src/infrastructure/queue/types/job.types';

export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly queueService: IQueueService,
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
      // Queue the email job instead of sending directly
      await this.queueService.addJob(
        JobType.EMAIL_PASSWORD_RESET,
        {
          email,
          userName: user.name,
          resetLink,
          expiresAt: expiresAt.toISOString(),
        },
        { priority: JobPriority.CRITICAL },
      );

      this.logger.log(`Password reset email queued for ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue password reset email for ${email}: ${error.message}`,
        error.stack,
      );
    }
  }
}
