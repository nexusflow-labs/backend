import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshAccessTokenUseCase } from './application/use-cases/refresh-access-token.use-case';
import { RevokeRefreshTokenUseCase } from './application/use-cases/revoke-refresh-token.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { PasswordHashingService } from './application/services/password-hashing.service';
import { AuthController } from './presentation/auth.controller';
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
    PasswordHashingService,
    RegisterUseCase,
    LoginUseCase,
    RefreshAccessTokenUseCase,
    RevokeRefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    JwtStrategy,
  ],
})
export class AuthModule {}
