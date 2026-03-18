import { Body, Post, HttpCode, HttpStatus, Controller } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
  MessageResponseDto,
  AuthResponseDto,
} from './dtos/auth.request.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtUser } from '../domain/entities/types/jwt-user.type';

@ApiTags('Auth')
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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.registerUseCase.execute(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.refreshAccessTokenUseCase.execute(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() logoutDto: LogoutDto): Promise<void> {
    await this.revokeRefreshTokenUseCase.execute(logoutDto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 204, description: 'Logged out from all devices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@CurrentUser() user: JwtUser): Promise<void> {
    await this.revokeRefreshTokenUseCase.executeAll(user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    type: MessageResponseDto,
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.forgotPasswordUseCase.execute(forgotPasswordDto.email);
    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.resetPasswordUseCase.execute({
      token: resetPasswordDto.token,
      newPassword: resetPasswordDto.newPassword,
    });
    return { message: 'Password has been reset successfully.' };
  }
}
