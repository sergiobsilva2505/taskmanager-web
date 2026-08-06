import { inject, Injectable } from '@angular/core';
import { AuthSession } from '@domain/user/auth-session';
import { AuthRepositoryPort } from '../ports/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class GoogleLoginUseCase {
  private readonly repository = inject(AuthRepositoryPort);

  execute(idToken: string): Promise<AuthSession> {
    return this.repository.googleLogin(idToken);
  }
}
