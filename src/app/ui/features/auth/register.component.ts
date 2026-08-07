import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterUseCase } from '@application/auth/use-cases/register.use-case';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <div class="brand">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--accent)" stroke-width="3" />
            <path
              d="M8 12.5l2.5 2.5L16 9"
              stroke="var(--accent)" stroke-width="2"
              fill="none" stroke-linecap="round" stroke-linejoin="round"
            />
          </svg>
          <span>TaskManager</span>
        </div>

        <h1>Criar conta</h1>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        @if (success()) {
          <p class="success">Conta criada! Redirecionando para o login…</p>
        }

        <form (ngSubmit)="submit()">
          <div class="field">
            <label for="name">Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              [(ngModel)]="name"
              placeholder="Seu nome"
              required
              autocomplete="name"
            />
          </div>

          <div class="field">
            <label for="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              [(ngModel)]="email"
              placeholder="seu@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="field">
            <label for="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              [(ngModel)]="password"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
            <span class="hint">
              Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.
            </span>
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading() || success()">
            {{ loading() ? 'Criando conta…' : 'Criar conta' }}
          </button>
        </form>

        <p class="footer-link">
          Já tem conta? <a routerLink="/login">Entrar</a>
        </p>
      </div>
    </div>
  `,
  styles: `
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      padding: 24px;
    }

    .card {
      width: 100%;
      max-width: 360px;
      background: var(--card);
      border: 0.5px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 15px;
      color: var(--text);
      margin-bottom: 4px;
    }

    h1 {
      font-size: 22px;
      font-weight: 500;
      margin: 0;
      color: var(--text);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      color: var(--text-2);
    }

    input {
      width: 100%;
    }

    .hint {
      font-size: 11px;
      color: var(--text-2);
      font-family: var(--font-mono);
    }

    .btn-primary {
      width: 100%;
      padding: 8px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 4px;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: default;
    }

    .error {
      color: var(--signal);
      font-size: 13px;
      margin: 0;
    }

    .success {
      color: var(--accent);
      font-size: 13px;
      margin: 0;
    }

    .footer-link {
      font-size: 13px;
      color: var(--text-2);
      text-align: center;
      margin: 0;
    }

    .footer-link a {
      color: var(--accent);
      text-decoration: none;
    }
  `,
})
export class RegisterComponent {
  private readonly registerUseCase = inject(RegisterUseCase);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  async submit(): Promise<void> {
    if (!this.name.trim() || !this.email.trim() || !this.password.trim()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.registerUseCase.execute({
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
      });
      this.success.set(true);
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } catch (err) {
      this.error.set(this.parseError(err));
    } finally {
      this.loading.set(false);
    }
  }

  private parseError(err: unknown): string {
    const status = (err as { status?: number } | null)?.status;
    if (status === 409) return 'Este e-mail já está cadastrado.';
    if (status === 400) return 'Verifique os dados informados e tente novamente.';
    return 'Não foi possível criar a conta. Tente novamente.';
  }
}
