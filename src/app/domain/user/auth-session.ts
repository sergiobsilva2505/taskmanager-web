export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: string;
}

export function isExpired(session: AuthSession, now: Date = new Date()): boolean {
  return new Date(session.expiresAt) <= now;
}
