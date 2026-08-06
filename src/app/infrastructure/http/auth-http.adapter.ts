import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '@domain/user/user.entity';
import { AuthSession } from '@domain/user/auth-session';
import {
  AuthRepositoryPort,
  LoginInput,
  RegisterInput,
} from '@application/auth/ports/auth-repository.port';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class AuthHttpAdapter implements AuthRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(input: LoginInput): Promise<AuthSession> {
    return firstValueFrom(
      this.http.post<AuthSession>(`${this.baseUrl}/auth/login`, input),
    );
  }

  googleLogin(idToken: string): Promise<AuthSession> {
    return firstValueFrom(
      this.http.post<AuthSession>(`${this.baseUrl}/auth/google`, { idToken }),
    );
  }

  register(input: RegisterInput): Promise<User> {
    return firstValueFrom(
      this.http.post<User>(`${this.baseUrl}/users`, input),
    );
  }
}
