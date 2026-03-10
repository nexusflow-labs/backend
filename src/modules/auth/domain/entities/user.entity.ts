export interface UserProps {
  id?: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
    };
  }

  public static create(props: UserProps): User {
    if (!props.email.includes('@')) {
      throw new Error('Email không hợp lệ');
    }
    if (props.password.length < 6) {
      throw new Error('Mật khẩu phải ít nhất 6 ký tự');
    }
    return new User(props);
  }

  get id() {
    return this.props.id;
  }
  get email() {
    return this.props.email;
  }
  get password() {
    return this.props.password;
  }
  get name() {
    return this.props.name;
  }
  get avatar() {
    return this.props.avatar;
  }
  get isActive() {
    return this.props.isActive ?? true;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  public updateName(newName: string) {
    if (newName.length < 2) throw new Error('Tên quá ngắn');
    this.props.name = newName;
  }

  public updatePassword(newPassword: string) {
    this.props.password = newPassword;
  }

  public toJSON() {
    return { ...this.props };
  }
}
