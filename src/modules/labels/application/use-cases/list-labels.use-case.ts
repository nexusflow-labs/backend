import { Injectable } from '@nestjs/common';
import { Label } from '../../domain/entities/label.entity';
import { ILabelRepository } from '../../domain/repositories/label.repository';

@Injectable()
export class ListLabelsUseCase {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(workspaceId: string): Promise<Label[]> {
    return this.labelRepository.findByWorkspace(workspaceId);
  }
}
