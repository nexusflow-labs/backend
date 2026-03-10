import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshAccessTokenUseCase } from './application/use-cases/refresh-access-token.use-case';
import { RevokeRefreshTokenUseCase } from './application/use-cases/revoke-refresh-token.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { PasswordHashingService } from './application/services/password-hashing.service';
import { IUserRepository } from './domain/repositories/user.repository';
import { IRefreshTokenRepository } from './domain/repositories/refresh-token.repository';
import { IPasswordResetTokenRepository } from './domain/repositories/password-reset-token.repository';
import { AuthController } from './presentation/auth.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-users.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository';
import { PrismaPasswordResetTokenRepository } from './infrastructure/persistence/prisma-password-reset-token.repository';
import { IEmailService } from 'src/infrastructure/email/interfaces/email.interface';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' }, // Short-lived access token
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Services
    PasswordHashingService,

    // Repositories
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: IRefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: IPasswordResetTokenRepository,
      useClass: PrismaPasswordResetTokenRepository,
    },

    // Use Cases
    {
      provide: RegisterUseCase,
      inject: [IUserRepository, PasswordHashingService],
      useFactory: (
        repo: IUserRepository,
        passwordHashingService: PasswordHashingService,
      ) => new RegisterUseCase(repo, passwordHashingService),
    },
    {
      provide: LoginUseCase,
      inject: [
        IUserRepository,
        IRefreshTokenRepository,
        JwtService,
        PasswordHashingService,
      ],
      useFactory: (
        userRepo: IUserRepository,
        refreshTokenRepo: IRefreshTokenRepository,
        jwtService: JwtService,
        passwordHashingService: PasswordHashingService,
      ) =>
        new LoginUseCase(
          userRepo,
          refreshTokenRepo,
          jwtService,
          passwordHashingService,
        ),
    },
    {
      provide: RefreshAccessTokenUseCase,
      inject: [IRefreshTokenRepository, IUserRepository, JwtService],
      useFactory: (
        refreshTokenRepo: IRefreshTokenRepository,
        userRepo: IUserRepository,
        jwtService: JwtService,
      ) =>
        new RefreshAccessTokenUseCase(refreshTokenRepo, userRepo, jwtService),
    },
    {
      provide: RevokeRefreshTokenUseCase,
      inject: [IRefreshTokenRepository],
      useFactory: (refreshTokenRepo: IRefreshTokenRepository) =>
        new RevokeRefreshTokenUseCase(refreshTokenRepo),
    },
    {
      provide: ForgotPasswordUseCase,
      inject: [
        IUserRepository,
        IPasswordResetTokenRepository,
        IEmailService,
        ConfigService,
      ],
      useFactory: (
        userRepo: IUserRepository,
        passwordResetTokenRepo: IPasswordResetTokenRepository,
        emailService: IEmailService,
        configService: ConfigService,
      ) =>
        new ForgotPasswordUseCase(
          userRepo,
          passwordResetTokenRepo,
          emailService,
          configService,
        ),
    },
    {
      provide: ResetPasswordUseCase,
      inject: [
        IUserRepository,
        IPasswordResetTokenRepository,
        IRefreshTokenRepository,
        PasswordHashingService,
      ],
      useFactory: (
        userRepo: IUserRepository,
        passwordResetTokenRepo: IPasswordResetTokenRepository,
        refreshTokenRepo: IRefreshTokenRepository,
        passwordHashingService: PasswordHashingService,
      ) =>
        new ResetPasswordUseCase(
          userRepo,
          passwordResetTokenRepo,
          refreshTokenRepo,
          passwordHashingService,
        ),
    },

    JwtStrategy,
  ],
  exports: [IUserRepository],
})
export class AuthModule {}
