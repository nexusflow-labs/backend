import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IFileUploadRepository } from '../../domain/repositories/file-upload.repository';
import { ConfirmUploadUseCase } from './confirm-upload.use-case';
import { FileUpload } from '../../domain/entities/file-upload.entity';
import { AttachableResourceType } from '../../domain/enums/resource-type.enum';
import { ITaskRepository } from '../../../tasks/domain/repositories/task.repository';

export interface AttachFileInput {
  fileId: string;
  resourceType: AttachableResourceType;
  resourceId: string;
}

@Injectable()
export class AttachFileUseCase {
  constructor(
    @Inject(IFileUploadRepository)
    private readonly fileUploadRepository: IFileUploadRepository,
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    private readonly confirmUploadUseCase: ConfirmUploadUseCase,
  ) {}

  async execute(input: AttachFileInput, userId: string): Promise<FileUpload> {
    // First, confirm the upload (this validates and updates status if needed)
    const fileUpload = await this.confirmUploadUseCase.execute(input.fileId);

    // Verify ownership
    if (fileUpload.uploaderId !== userId) {
      throw new ForbiddenException(
        'You can only attach files that you uploaded',
      );
    }

    // Check if already attached
    if (fileUpload.isAttached()) {
      throw new BadRequestException('File is already attached to a resource');
    }

    // Validate resource exists
    await this.validateResourceAccess(input.resourceType, input.resourceId);

    // Attach the file
    fileUpload.attachToResource(input.resourceType, input.resourceId);
    await this.fileUploadRepository.save(fileUpload);

    return fileUpload;
  }

  private async validateResourceAccess(
    resourceType: AttachableResourceType,
    resourceId: string,
  ): Promise<void> {
    switch (resourceType) {
      case AttachableResourceType.TASK: {
        const task = await this.taskRepository.findById(resourceId);
        if (!task) {
          throw new NotFoundException('Task not found');
        }
        // Task access is already validated by WorkspaceMemberGuard
        break;
      }

      case AttachableResourceType.COMMENT: {
        // Comment validation would go here
        // For now, just verify the ID format
        if (!resourceId) {
          throw new NotFoundException('Comment not found');
        }
        break;
      }
    }
  }
}
