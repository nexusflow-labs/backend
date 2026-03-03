import { Label } from '../../domain/entities/label.entity';
import { Label as PrismaLabel } from 'generated/prisma/browser';

export class LabelMapper {
  static toEntity(raw: PrismaLabel): Label {
    return Label.reconstitute({
      id: raw.id,
      name: raw.name,
      color: raw.color,
      workspaceId: raw.workspaceId,
      createdAt: raw.createdAt,
    });
  }
}
