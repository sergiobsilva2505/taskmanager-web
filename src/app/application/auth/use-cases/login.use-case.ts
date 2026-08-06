import { inject, Injectable } from '@angular/core';
import { AuthSession } from '@domain/user/auth-session';
import { AuthRepositoryPort, LoginInput } from '../ports/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private readonly repository = inject(AuthRepositoryPort);

  execute(input: LoginInput): Promise<AuthSession> {
    return this.repository.login(input);
  }
}
