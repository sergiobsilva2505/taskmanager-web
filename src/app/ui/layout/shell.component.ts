import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ThemeToggleComponent } from '@ui/shared/theme-toggle.component';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <div class="shell">
      <aside>
        <div class="brand">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="none" stroke="var(--accent)" stroke-width="2.5" />
            <path
              d="M5.5 8l1.7 1.7L11 6"
              stroke="var(--accent)"
              stroke-width="1.6"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>TaskManager</span>
        </div>

        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Tarefas
          </a>
          <a routerLink="/dashboard" routerLinkActive="active">
            Painel
          </a>
        </nav>

        <div class="footer">
          <app-theme-toggle />
          <button class="logout-btn" (click)="logout()">Sair</button>
        </div>
      </aside>

      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .shell {
      display: grid;
      grid-template-columns: 180px 1fr;
      min-height: 100vh;
    }

    aside {
      display: flex;
      flex-direction: column;
      padding: 16px 14px;
      border-right: 0.5px solid var(--border);
      background: color-mix(in srgb, var(--card) 55%, var(--bg));
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 24px;
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    nav a {
      padding: 6px 8px;
      border-radius: var(--radius);
      font-size: 13px;
      color: var(--text-2);
      text-decoration: none;
    }

    nav a:hover {
      color: var(--text);
    }

    nav a.active {
      color: var(--text);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }

    .footer {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .logout-btn {
      font-size: 13px;
      color: var(--text-2);
      background: none;
      border: none;
      padding: 6px 8px;
      text-align: left;
      cursor: pointer;
      border-radius: var(--radius);
    }

    .logout-btn:hover {
      color: var(--signal);
      background: color-mix(in srgb, var(--signal) 8%, transparent);
      border: none;
    }

    main {
      min-width: 0;
    }
  `,
})
export class ShellComponent {
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  logout(): void {
    this.authState.clear();
    this.router.navigate(['/login']);
  }
}
