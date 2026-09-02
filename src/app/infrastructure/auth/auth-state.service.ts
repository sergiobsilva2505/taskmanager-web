import { Injectable, signal, computed } from '@angular/core';
import { AuthSession } from '@domain/user/auth-session';

const SESSION_KEY = 'tm_session';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly session = signal<AuthSession | null>(this.load());

  readonly isAuthenticated = computed(() => {
    const s = this.session();
    return s !== null && !s.isExpired();
  });

  readonly userId = computed(() => this.session()?.userId ?? null);
  readonly token = computed(() => this.session()?.token ?? null);

  save(session: AuthSession): void {
    this.session.set(session);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    this.session.set(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  private load(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = new AuthSession(JSON.parse(raw));
      if (session.isExpired()) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
