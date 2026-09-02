export interface AuthSessionProps {
  token: string;
  userId: string;
  expiresAt: string;
}

export class AuthSession {
  readonly token: string;
  readonly userId: string;
  readonly expiresAt: string;

  constructor(props: AuthSessionProps) {
    this.token = props.token;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
  }

  isExpired(now: Date = new Date()): boolean {
    return new Date(this.expiresAt) <= now;
  }
}
