import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'tm_theme';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  function create(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  it('usa o tema salvo no localStorage quando existe', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    expect(create().theme()).toBe('dark');
  });

  it('ignora um valor inválido no localStorage e cai na preferência do sistema', () => {
    localStorage.setItem(STORAGE_KEY, 'sepia');
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    expect(create().theme()).toBe('dark');
  });

  it('usa a preferência clara do sistema quando não há tema salvo', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    expect(create().theme()).toBe('light');
  });

  it('toggle alterna o tema, persiste no localStorage e aplica no documento', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const service = create();

    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');

    service.toggle();

    expect(service.theme()).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('init aplica o tema atual ao elemento raiz do documento', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const service = create();

    service.init();

    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
