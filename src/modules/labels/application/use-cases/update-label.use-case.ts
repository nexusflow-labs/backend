import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Label } from '../../domain/entities/label.entity';
import { ILabelRepository } from '../../domain/repositories/label.repository';

export interface UpdateLabelInput {
  name?: string;
  color?: string;
}

@Injectable()
export class UpdateLabelUseCase {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(id: string, input: UpdateLabelInput): Promise<Label> {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    if (input.name && input.name !== label.name) {
      const existing = await this.labelRepository.findByNameInWorkspace(
        label.workspaceId,
        input.name,
      );
      if (existing) {
        throw new ConflictException(
          'A label with this name already exists in this workspace',
        );
      }
      label.updateName(input.name);
    }

    if (input.color) {
      label.updateColor(input.color);
    }

    await this.labelRepository.save(label);

    return label;
  }
}
