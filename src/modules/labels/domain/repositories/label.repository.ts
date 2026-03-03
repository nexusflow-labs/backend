import { Label } from '../entities/label.entity';

export interface CreateLabelData {
  name: string;
  color?: string;
  workspaceId: string;
}

export abstract class ILabelRepository {
  abstract create(data: CreateLabelData): Promise<Label>;
  abstract save(label: Label): Promise<void>;
  abstract findById(id: string): Promise<Label | null>;
  abstract findByWorkspace(workspaceId: string): Promise<Label[]>;
  abstract findByNameInWorkspace(
    workspaceId: string,
    name: string,
  ): Promise<Label | null>;
  abstract delete(id: string): Promise<void>;
  abstract addLabelToTask(taskId: string, labelId: string): Promise<void>;
  abstract removeLabelFromTask(taskId: string, labelId: string): Promise<void>;
  abstract findByTask(taskId: string): Promise<Label[]>;
  abstract isLabelAttachedToTask(
    taskId: string,
    labelId: string,
  ): Promise<boolean>;
}
