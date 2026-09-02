import { inject, Injectable } from '@angular/core';
import { User } from '@domain/user/user.entity';
import { AuthRepositoryPort, RegisterInput, RegisterParams } from '../ports/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class RegisterUseCase {
  private readonly repository = inject(AuthRepositoryPort);

  async execute(params: RegisterParams): Promise<User> {
    const input = new RegisterInput(params);
    return this.repository.register(input);
  }
}
