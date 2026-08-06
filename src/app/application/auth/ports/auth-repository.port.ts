import { User } from '@domain/user/user.entity';
import { AuthSession } from '@domain/user/auth-session';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export abstract class AuthRepositoryPort {
  abstract login(input: LoginInput): Promise<AuthSession>;
  abstract googleLogin(idToken: string): Promise<AuthSession>;
  abstract register(input: RegisterInput): Promise<User>;
}
