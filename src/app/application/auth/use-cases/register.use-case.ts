import { inject, Injectable } from '@angular/core';
import { User } from '@domain/user/user.entity';
import { AuthRepositoryPort, RegisterInput } from '../ports/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class RegisterUseCase {
  private readonly repository = inject(AuthRepositoryPort);

  execute(input: RegisterInput): Promise<User> {
    return this.repository.register(input);
  }
}
