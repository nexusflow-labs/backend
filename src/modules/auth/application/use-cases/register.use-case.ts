import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../../presentation/dtos/auth.request.dto';
import { PasswordHashingService } from '../services/password-hashing.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async execute(dto: CreateUserDto): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPassword = await this.passwordHashingService.hash(dto.password);

    const user = User.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      avatar: dto.avatar,
    });

    await this.userRepository.save(user);
  }
}
