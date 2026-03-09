import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshAccessTokenUseCase } from './application/use-cases/refresh-access-token.use-case';
import { RevokeRefreshTokenUseCase } from './application/use-cases/revoke-refresh-token.use-case';
import { PasswordHashingService } from './application/services/password-hashing.service';
import { IUserRepository } from './domain/repositories/user.repository';
import { IRefreshTokenRepository } from './domain/repositories/refresh-token.repository';
import { AuthController } from './presentation/auth.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-users.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository';
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

    JwtStrategy,
  ],
  exports: [IUserRepository],
})
export class AuthModule {}
