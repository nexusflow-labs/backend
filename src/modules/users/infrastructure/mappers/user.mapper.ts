import { User as PrismaUser } from 'generated/prisma/browser';
import { User as UserEntity } from '../../domain/entities/user.entitiy';

export class UserMapper {
  static toDomain(raw: PrismaUser): UserEntity {
    return UserEntity.create({
      id: raw.id,
      email: raw.email,
      password: raw.password,
      name: raw.fullName,
      avatar: raw.avatar || undefined,
      createdAt: raw.createdAt,
    });
  }

  static toUserEntity(entity: UserEntity) {
    return {
      id: entity.id,
      email: entity.email,
      password: entity.password,
      fullName: entity.name,
      avatar: entity.avatar,
    };
  }
}
