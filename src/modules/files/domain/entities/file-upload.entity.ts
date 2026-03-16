import { FileUploadStatus } from '../enums/file-upload-status.enum';
import { AttachableResourceType } from '../enums/resource-type.enum';

export interface FileUploadProps {
  id: string;
  filename: string;
  contentType: string;
  size?: number | null;
  storageKey: string;
  status: FileUploadStatus;
  resourceType?: AttachableResourceType | null;
  resourceId?: string | null;
  uploaderId: string;
  workspaceId?: string | null;
  expiresAt: Date;
  uploadedAt?: Date | null;
  attachedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FileUpload {
  private constructor(private readonly props: FileUploadProps) {}

  public static reconstitute(props: FileUploadProps): FileUpload {
    return new FileUpload(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get filename(): string {
    return this.props.filename;
  }

  get contentType(): string {
    return this.props.contentType;
  }

  get size(): number | null | undefined {
    return this.props.size;
  }

  get storageKey(): string {
    return this.props.storageKey;
  }

  get status(): FileUploadStatus {
    return this.props.status;
  }

  get resourceType(): AttachableResourceType | null | undefined {
    return this.props.resourceType;
  }

  get resourceId(): string | null | undefined {
    return this.props.resourceId;
  }

  get uploaderId(): string {
    return this.props.uploaderId;
  }

  get workspaceId(): string | null | undefined {
    return this.props.workspaceId;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get uploadedAt(): Date | null | undefined {
    return this.props.uploadedAt;
  }

  get attachedAt(): Date | null | undefined {
    return this.props.attachedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods

  /**
   * Check if the pre-signed URL has expired
   */
  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  /**
   * Check if the file has been uploaded
   */
  isUploaded(): boolean {
    return (
      this.props.status === FileUploadStatus.UPLOADED ||
      this.props.status === FileUploadStatus.ATTACHED
    );
  }

  /**
   * Check if the file is attached to a resource
   */
  isAttached(): boolean {
    return this.props.status === FileUploadStatus.ATTACHED;
  }

  /**
   * Check if the file can still be uploaded (not expired and not yet uploaded)
   */
  canBeUploaded(): boolean {
    return (
      this.props.status === FileUploadStatus.PENDING && !this.isExpired()
    );
  }

  /**
   * Check if the file can be attached (uploaded but not yet attached)
   */
  canBeAttached(): boolean {
    return this.props.status === FileUploadStatus.UPLOADED;
  }

  /**
   * Mark the file as uploaded
   */
  markAsUploaded(size: number): void {
    if (!this.canBeUploaded() && this.props.status !== FileUploadStatus.PENDING) {
      throw new Error('File cannot be marked as uploaded');
    }
    (this.props as any).status = FileUploadStatus.UPLOADED;
    (this.props as any).size = size;
    (this.props as any).uploadedAt = new Date();
  }

  /**
   * Attach the file to a resource
   */
  attachToResource(
    resourceType: AttachableResourceType,
    resourceId: string,
  ): void {
    if (!this.canBeAttached()) {
      throw new Error('File cannot be attached - must be uploaded first');
    }
    (this.props as any).status = FileUploadStatus.ATTACHED;
    (this.props as any).resourceType = resourceType;
    (this.props as any).resourceId = resourceId;
    (this.props as any).attachedAt = new Date();
  }

  /**
   * Mark the file as expired
   */
  markAsExpired(): void {
    if (this.props.status === FileUploadStatus.PENDING) {
      (this.props as any).status = FileUploadStatus.EXPIRED;
    }
  }
}
