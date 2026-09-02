import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LoginUseCase } from '@application/auth/use-cases/login.use-case';
import { GoogleLoginUseCase } from '@application/auth/use-cases/google-login.use-case';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';
import { environment } from '@env/environment';

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }) => void;
      renderButton: (parent: HTMLElement | null, options: Record<string, unknown>) => void;
    };
  };
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <div class="brand">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--accent)" stroke-width="3" />
            <path
              d="M8 12.5l2.5 2.5L16 9"
              stroke="var(--accent)"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>TaskManager</span>
        </div>

        <h1>Entrar</h1>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <form (ngSubmit)="submit()">
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
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading()">
            {{ loading() ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>

        <div class="divider"><span>ou</span></div>

        <div id="google-btn"></div>

        <p class="footer-link">Não tem conta? <a routerLink="/register">Criar conta</a></p>
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

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
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

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-2);
      font-size: 12px;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 0.5px;
      background: var(--border);
    }

    #google-btn {
      display: flex;
      justify-content: center;
    }

    .error {
      color: var(--signal);
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
export class LoginComponent implements OnInit {
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly googleLoginUseCase = inject(GoogleLoginUseCase);
  private readonly logger = inject(LoggerPort);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);

  email = '';
  password = '';

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.initGoogleButton();
  }

  async submit(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const session = await this.loginUseCase.execute({
        email: this.email.trim(),
        password: this.password,
      });
      this.authState.save(session);
      this.redirect();
    } catch (err) {
      this.logger.error('Falha ao autenticar usuário', err, { email: this.email });
      this.error.set('E-mail ou senha incorretos.');
    } finally {
      this.loading.set(false);
    }
  }

  private initGoogleButton(): void {
    const waitForGoogle = setInterval(() => {
      const google = (window as unknown as { google?: GoogleIdentityServices }).google;
      if (!google) return;
      clearInterval(waitForGoogle);

      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: { credential: string }) => {
          this.ngZone.run(() => this.handleGoogleCallback(response.credential));
        },
      });

      google.accounts.id.renderButton(document.getElementById('google-btn'), {
        theme: 'outline',
        size: 'large',
        width: 296,
        text: 'continue_with',
        locale: 'pt-BR',
      });
    }, 100);
  }

  private async handleGoogleCallback(idToken: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const session = await this.googleLoginUseCase.execute(idToken);
      this.authState.save(session);
      this.redirect();
    } catch (err) {
      this.logger.error('Falha ao autenticar usuário via Google', err);
      this.error.set('Não foi possível entrar com o Google.');
    } finally {
      this.loading.set(false);
    }
  }

  private redirect(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    this.router.navigateByUrl(returnUrl);
  }
}
