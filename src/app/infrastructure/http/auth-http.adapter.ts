import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '@domain/user/user.entity';
import { AuthSession, AuthSessionProps } from '@domain/user/auth-session';
import {
  AuthRepositoryPort,
  LoginInput,
  RegisterInput,
} from '@application/auth/ports/auth-repository.port';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class AuthHttpAdapter implements AuthRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly logger = inject(LoggerPort);

  async login(input: LoginInput): Promise<AuthSession> {
    this.logger.info('Autenticando usuário', { email: input.email });
    try {
      const dto = await firstValueFrom(
        this.http.post<AuthSessionProps>(`${this.baseUrl}/auth/login`, input),
      );
      const session = new AuthSession(dto);
      this.logger.info('Usuário autenticado', { userId: session.userId });
      return session;
    } catch (error) {
      this.logger.error('Falha ao autenticar usuário', error, { email: input.email });
      throw error;
    }
  }

  async googleLogin(idToken: string): Promise<AuthSession> {
    this.logger.info('Autenticando usuário via Google');
    try {
      const dto = await firstValueFrom(
        this.http.post<AuthSessionProps>(`${this.baseUrl}/auth/google`, { idToken }),
      );
      const session = new AuthSession(dto);
      this.logger.info('Usuário autenticado via Google', { userId: session.userId });
      return session;
    } catch (error) {
      this.logger.error('Falha ao autenticar usuário via Google', error);
      throw error;
    }
  }

  async register(input: RegisterInput): Promise<User> {
    this.logger.info('Registrando usuário', { email: input.email });
    try {
      const user = await firstValueFrom(this.http.post<User>(`${this.baseUrl}/users`, input));
      this.logger.info('Usuário registrado', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Falha ao registrar usuário', error, { email: input.email });
      throw error;
    }
  }
}
