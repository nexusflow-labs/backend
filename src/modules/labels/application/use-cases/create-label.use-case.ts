import { Injectable, ConflictException } from '@nestjs/common';
import { Label } from '../../domain/entities/label.entity';
import { ILabelRepository } from '../../domain/repositories/label.repository';

@Injectable()
export class CreateLabelUseCase {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(
    name: string,
    workspaceId: string,
    color?: string,
  ): Promise<Label> {
    if (name.length < 1) {
      throw new Error('Label name cannot be empty');
    }

    const existing = await this.labelRepository.findByNameInWorkspace(
      workspaceId,
      name,
    );
    if (existing) {
      throw new ConflictException(
        'A label with this name already exists in this workspace',
      );
    }

    return this.labelRepository.create({
      name,
      workspaceId,
      color,
    });
  }
}
