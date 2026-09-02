import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ThemeService, Theme } from './theme.service';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  const theme = signal<Theme>('dark');
  const toggle = vi.fn(() => theme.set(theme() === 'dark' ? 'light' : 'dark'));

  beforeEach(() => {
    theme.set('dark');
    toggle.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ThemeService, useValue: { theme, toggle } },
      ],
    });
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('mostra o ícone de sol e o rótulo para trocar para o tema claro quando está escuro', () => {
    const button: HTMLButtonElement = createComponent().nativeElement.querySelector('button');
    expect(button.textContent?.trim()).toBe('☀');
    expect(button.getAttribute('aria-label')).toBe('Mudar para tema claro');
  });

  it('chama toggle e atualiza o ícone ao clicar', () => {
    const fixture = createComponent();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();
    fixture.detectChanges();

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(button.textContent?.trim()).toBe('☾');
    expect(button.getAttribute('aria-label')).toBe('Mudar para tema escuro');
  });
});
