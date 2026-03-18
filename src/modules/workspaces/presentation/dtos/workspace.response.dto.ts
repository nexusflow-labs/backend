import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceResponseDto {
  @ApiProperty({
    description: 'Workspace ID',
    example: '48a30c8b-53ca-4786-9d60-942bd1c2e241',
  })
  id: string;

  @ApiProperty({
    description: 'Workspace name',
    example: 'My Workspace',
  })
  name: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
