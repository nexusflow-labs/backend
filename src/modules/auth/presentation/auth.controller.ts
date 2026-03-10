import { Body, Post, HttpCode, HttpStatus, Controller } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshAccessTokenUseCase } from '../application/use-cases/refresh-access-token.use-case';
import { RevokeRefreshTokenUseCase } from '../application/use-cases/revoke-refresh-token.use-case';
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../application/use-cases/reset-password.use-case';
import {
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dtos/auth.request.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtUser } from '../domain/entities/types/jwt-user.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
    private readonly revokeRefreshTokenUseCase: RevokeRefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async register(@Body() createUserDto: CreateUserDto) {
    return this.registerUseCase.execute(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.refreshAccessTokenUseCase.execute(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() logoutDto: LogoutDto) {
    await this.revokeRefreshTokenUseCase.execute(logoutDto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@CurrentUser() user: JwtUser) {
    await this.revokeRefreshTokenUseCase.executeAll(user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.forgotPasswordUseCase.execute(forgotPasswordDto.email);
    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute({
      token: resetPasswordDto.token,
      newPassword: resetPasswordDto.newPassword,
    });
    return { message: 'Password has been reset successfully.' };
  }
}
