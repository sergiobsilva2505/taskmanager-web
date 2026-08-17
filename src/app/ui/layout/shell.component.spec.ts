import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';
import { ShellComponent } from './shell.component';

function stubMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

describe('ShellComponent', () => {
  let clearSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    stubMatchMedia();
    localStorage.clear();
    clearSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthStateService, useValue: { clear: clearSpy } },
      ],
    });
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza os links de navegação', () => {
    const fixture = createComponent();
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('nav a');
    expect(links).toHaveLength(2);
    expect(links[0].textContent).toContain('Tarefas');
    expect(links[1].textContent).toContain('Painel');
  });

  it('limpa a sessão e navega para /login ao clicar em Sair', () => {
    const fixture = createComponent();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const logoutBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.logout-btn');
    logoutBtn.click();

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('chama authState.clear() antes de navegar', () => {
    const fixture = createComponent();
    const router = TestBed.inject(Router);
    const calls: string[] = [];
    clearSpy.mockImplementation(() => calls.push('clear'));
    vi.spyOn(router, 'navigate').mockImplementation(() => {
      calls.push('navigate');
      return Promise.resolve(true);
    });

    fixture.componentInstance.logout();

    expect(calls).toEqual(['clear', 'navigate']);
  });
});
