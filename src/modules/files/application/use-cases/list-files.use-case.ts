import { Injectable, Inject } from '@nestjs/common';
import { IFileUploadRepository } from '../../domain/repositories/file-upload.repository';
import { FileUpload } from '../../domain/entities/file-upload.entity';
import { AttachableResourceType } from '../../domain/enums/resource-type.enum';

export interface ListFilesInput {
  resourceType: AttachableResourceType;
  resourceId: string;
}

@Injectable()
export class ListFilesUseCase {
  constructor(
    @Inject(IFileUploadRepository)
    private readonly fileUploadRepository: IFileUploadRepository,
  ) {}

  async execute(input: ListFilesInput): Promise<FileUpload[]> {
    return this.fileUploadRepository.findByResource(
      input.resourceType,
      input.resourceId,
    );
  }
}
