import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '@ui/shared/theme-toggle.component';

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
              stroke="var(--accent)" stroke-width="1.6"
              fill="none" stroke-linecap="round" stroke-linejoin="round"
            />
          </svg>
          <span>TaskManager</span>
        </div>

        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Tarefas
          </a>
        </nav>

        <div class="footer">
          <app-theme-toggle />
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
      justify-content: flex-start;
    }

    main {
      min-width: 0;
    }
  `,
})
export class ShellComponent {}
