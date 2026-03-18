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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
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

  @Post('files/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a file upload and get pre-signed URL' })
  @ApiResponse({
    status: 201,
    description: 'Upload registered',
    type: RegisterUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Post('files/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Local upload endpoint (development only)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'key', description: 'File key', type: 'string' })
  @ApiQuery({
    name: 'contentType',
    description: 'Content type',
    type: 'string',
  })
  @ApiQuery({
    name: 'expires',
    description: 'Expiration timestamp',
    type: 'string',
  })
  @ApiQuery({ name: 'token', description: 'Upload token', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired upload URL' })
  async localUpload(
    @Query('key') key: string,
    @Query('contentType') contentType: string,
    @Query('expires') expires: string,
    @Query('token') token: string,
    @UploadedFile() file: UploadedFileData,
  ): Promise<{ success: boolean }> {
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

    await this.localStorageService.saveFile(key, file.buffer);

    return { success: true };
  }

  @Get('files/download')
  @ApiOperation({ summary: 'Local download endpoint (development only)' })
  @ApiQuery({ name: 'key', description: 'File key', type: 'string' })
  @ApiQuery({
    name: 'expires',
    description: 'Expiration timestamp',
    type: 'string',
  })
  @ApiQuery({ name: 'token', description: 'Download token', type: 'string' })
  @ApiResponse({ status: 200, description: 'File content' })
  @ApiResponse({ status: 400, description: 'Invalid or expired download URL' })
  @ApiResponse({ status: 404, description: 'File not found' })
  localDownload(
    @Query('key') key: string,
    @Query('expires') expires: string,
    @Query('token') token: string,
    @Res() res: Response,
  ): void {
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

    const filePath = this.localStorageService.getFilePath(key);
    const stream = fs.createReadStream(filePath);

    stream.on('error', () => {
      res.status(404).json({ error: 'File not found' });
    });

    stream.pipe(res);
  }

  @Post('tasks/:taskId/attachments')
  @UseGuards(WorkspaceMemberGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Attach a file to a task' })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'File attached',
    type: FileUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File not uploaded or already attached',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task or file not found' })
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

  @Get('tasks/:taskId/attachments')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'List attachments for a task' })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attachments',
    type: [FileUploadResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async listTaskAttachments(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
  ): Promise<FileUploadResponseDto[]> {
    const files = await this.listFilesUseCase.execute({
      resourceType: AttachableResourceType.TASK,
      resourceId: taskId,
    });

    return FileUploadResponseDto.fromEntities(files);
  }

  @Get('files/:fileId/download')
  @ApiOperation({ summary: 'Get pre-signed download URL for a file' })
  @ApiParam({
    name: 'fileId',
    description: 'File ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Download URL',
    type: DownloadUrlResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getDownloadUrl(
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
  ): Promise<DownloadUrlResponseDto> {
    return this.getDownloadUrlUseCase.execute(fileId);
  }

  @Delete('files/:fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({
    name: 'fileId',
    description: 'File ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'File deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not the file owner' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.deleteFileUseCase.execute(fileId, user.id);
  }
}
