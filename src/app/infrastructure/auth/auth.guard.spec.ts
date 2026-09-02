import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthStateService } from './auth-state.service';
import { authGuard } from './auth.guard';

function runGuard(url: string) {
  const state = { url } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => authGuard(route, state));
}

describe('authGuard', () => {
  let authenticated: boolean;

  beforeEach(() => {
    authenticated = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: { isAuthenticated: () => authenticated } },
      ],
    });
  });

  it('libera a navegação quando o usuário está autenticado', () => {
    authenticated = true;
    expect(runGuard('/')).toBe(true);
  });

  it('redireciona para /login preservando a URL de origem em returnUrl', () => {
    authenticated = false;
    const router = TestBed.inject(Router);

    const result = runGuard('/tasks/42');

    expect(result).toBeInstanceOf(UrlTree);
    const expected = router.createUrlTree(['/login'], {
      queryParams: { returnUrl: '/tasks/42' },
    });
    expect((result as UrlTree).toString()).toBe(expected.toString());
    expect((result as UrlTree).toString()).toContain('returnUrl=%2Ftasks%2F42');
  });
});
