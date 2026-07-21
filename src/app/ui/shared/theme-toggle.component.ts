import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.theme() === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
    >
      {{ theme.theme() === 'dark' ? '☀' : '☾' }}
    </button>
  `,
  styles: `
    button {
      width: 30px;
      height: 30px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      line-height: 1;
    }
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}

