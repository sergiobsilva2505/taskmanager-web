import { User } from '@domain/user/user.entity';
import { AuthSession } from '@domain/user/auth-session';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export class RegisterInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;

  constructor(params: RegisterParams) {
    const name = params.name.trim();
    if (!name) throw new Error('O nome é obrigatório.');

    const email = params.email.trim();
    if (!EMAIL_PATTERN.test(email)) throw new Error('Informe um e-mail válido.');

    if (!PASSWORD_PATTERN.test(params.password)) {
      throw new Error(
        'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial.',
      );
    }

    this.name = name;
    this.email = email;
    this.password = params.password;
  }
}

export abstract class AuthRepositoryPort {
  abstract login(input: LoginInput): Promise<AuthSession>;
  abstract googleLogin(idToken: string): Promise<AuthSession>;
  abstract register(input: RegisterInput): Promise<User>;
}
