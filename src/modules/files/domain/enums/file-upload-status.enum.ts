export enum FileUploadStatus {
  PENDING = 'PENDING', // URL registered but file not yet uploaded
  UPLOADED = 'UPLOADED', // File uploaded (confirmed by checking storage)
  ATTACHED = 'ATTACHED', // File attached to a resource
  EXPIRED = 'EXPIRED', // URL expired without being used
}
