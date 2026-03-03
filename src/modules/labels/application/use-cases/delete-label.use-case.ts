import { Injectable, NotFoundException } from '@nestjs/common';
import { ILabelRepository } from '../../domain/repositories/label.repository';

@Injectable()
export class DeleteLabelUseCase {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(id: string): Promise<void> {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    await this.labelRepository.delete(id);
  }
}
