import * as bcrypt from 'bcrypt';
import { Injectable, ConflictException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entitiy';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../../presentation/dtos/user.request.dto';

@Injectable()
export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = User.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      avatar: dto.avatar,
    });

    await this.userRepository.save(user);
  }
}
