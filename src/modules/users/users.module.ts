import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { IUserRepository } from './domain/repositories/user.repository';
import { UserController } from './presentation/users.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-users.repository';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: RegisterUseCase,
      inject: [IUserRepository],
      useFactory: (repo: IUserRepository) => new RegisterUseCase(repo),
    },
    {
      provide: LoginUseCase,
      inject: [IUserRepository, JwtService],
      useFactory: (repo: IUserRepository, jwtService: JwtService) =>
        new LoginUseCase(repo, jwtService),
    },
  ],
})
export class UserModule {}
