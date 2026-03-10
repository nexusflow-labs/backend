export interface PasswordResetTokenProps {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export class PasswordResetToken {
  private constructor(private readonly props: PasswordResetTokenProps) {}

  public static reconstitute(
    props: PasswordResetTokenProps,
  ): PasswordResetToken {
    return new PasswordResetToken(props);
  }

  get id(): string {
    return this.props.id;
  }

  get token(): string {
    return this.props.token;
  }

  get userId(): string {
    return this.props.userId;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get usedAt(): Date | undefined {
    return this.props.usedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isUsed(): boolean {
    return !!this.props.usedAt;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }

  markAsUsed(): void {
    this.props.usedAt = new Date();
  }
}
