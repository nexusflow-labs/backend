import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';

interface UploadedFileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
import { RegisterUploadUseCase } from '../application/use-cases/register-upload.use-case';
import { AttachFileUseCase } from '../application/use-cases/attach-file.use-case';
import { ListFilesUseCase } from '../application/use-cases/list-files.use-case';
import { GetDownloadUrlUseCase } from '../application/use-cases/get-download-url.use-case';
import { DeleteFileUseCase } from '../application/use-cases/delete-file.use-case';
import { RegisterUploadDto, AttachFileDto } from './dtos/file.request.dto';
import {
  RegisterUploadResponseDto,
  FileUploadResponseDto,
  DownloadUrlResponseDto,
} from './dtos/file.response.dto';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import type { JwtUser } from '../../auth/domain/entities/types/jwt-user.type';
import { WorkspaceMemberGuard } from '../../../infrastructure/authorization/guards/workspace-member.guard';
import { AttachableResourceType } from '../domain/enums/resource-type.enum';
import { LocalStorageService } from '../../../infrastructure/storage/services/local-storage.service';

/**
 * Files Controller
 *
 * Handles file upload flow:
 * 1. POST /files/register - Register upload, get pre-signed URL
 * 2. User uploads directly to URL (local endpoint or S3)
 * 3. POST /tasks/:taskId/attachments - Attach file to task
 *
 * For local development, also handles:
 * - PUT /files/upload - Local upload endpoint (simulates S3)
 * - GET /files/download - Local download endpoint (simulates S3)
 */
@Controller()
export class FilesController {
  constructor(
    private readonly registerUploadUseCase: RegisterUploadUseCase,
    private readonly attachFileUseCase: AttachFileUseCase,
    private readonly listFilesUseCase: ListFilesUseCase,
    private readonly getDownloadUrlUseCase: GetDownloadUrlUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly localStorageService: LocalStorageService,
  ) {}

  /**
   * Register a new file upload and get a pre-signed URL
   */
  @Post('files/register')
  @HttpCode(HttpStatus.CREATED)
  async registerUpload(
    @Body() dto: RegisterUploadDto,
    @CurrentUser() user: JwtUser,
  ): Promise<RegisterUploadResponseDto> {
    const result = await this.registerUploadUseCase.execute(
      {
        filename: dto.filename,
        contentType: dto.contentType,
        workspaceId: dto.workspaceId,
      },
      user.id,
    );

    return {
      id: result.id,
      uploadUrl: result.uploadUrl,
      expiresAt: result.expiresAt,
    };
  }

  /**
   * Local upload endpoint (for local development)
   * In production, files are uploaded directly to S3 using pre-signed URLs
   */
  @Post('files/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async localUpload(
    @Query('key') key: string,
    @Query('contentType') contentType: string,
    @Query('expires') expires: string,
    @Query('token') token: string,
    @UploadedFile() file: UploadedFileData,
  ): Promise<{ success: boolean }> {
    // Validate the upload token
    const expiresAt = parseInt(expires, 10);
    const isValid = this.localStorageService.validateUploadToken(
      key,
      contentType,
      expiresAt,
      token,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or expired upload URL');
    }

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Save the file
    await this.localStorageService.saveFile(key, file.buffer);

    return { success: true };
  }

  /**
   * Local download endpoint (for local development)
   */
  @Get('files/download')
  localDownload(
    @Query('key') key: string,
    @Query('expires') expires: string,
    @Query('token') token: string,
    @Res() res: Response,
  ): void {
    // Validate the download token
    const expiresAt = parseInt(expires, 10);
    const isValid = this.localStorageService.validateUploadToken(
      key,
      '',
      expiresAt,
      token,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or expired download URL');
    }

    // Stream the file
    const filePath = this.localStorageService.getFilePath(key);
    const stream = fs.createReadStream(filePath);

    stream.on('error', () => {
      res.status(404).json({ error: 'File not found' });
    });

    stream.pipe(res);
  }

  /**
   * Attach a file to a task
   */
  @Post('tasks/:taskId/attachments')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.CREATED)
  async attachToTask(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Body() dto: AttachFileDto,
    @CurrentUser() user: JwtUser,
  ): Promise<FileUploadResponseDto> {
    const fileUpload = await this.attachFileUseCase.execute(
      {
        fileId: dto.fileId,
        resourceType: AttachableResourceType.TASK,
        resourceId: taskId,
      },
      user.id,
    );

    return FileUploadResponseDto.fromEntity(fileUpload);
  }

  /**
   * List attachments for a task
   */
  @Get('tasks/:taskId/attachments')
  @UseGuards(WorkspaceMemberGuard)
  async listTaskAttachments(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
  ): Promise<FileUploadResponseDto[]> {
    const files = await this.listFilesUseCase.execute({
      resourceType: AttachableResourceType.TASK,
      resourceId: taskId,
    });

    return FileUploadResponseDto.fromEntities(files);
  }

  /**
   * Get download URL for a file
   */
  @Get('files/:fileId/download')
  async getDownloadUrl(
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
  ): Promise<DownloadUrlResponseDto> {
    return this.getDownloadUrlUseCase.execute(fileId);
  }

  /**
   * Delete a file
   */
  @Delete('files/:fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.deleteFileUseCase.execute(fileId, user.id);
  }
}
