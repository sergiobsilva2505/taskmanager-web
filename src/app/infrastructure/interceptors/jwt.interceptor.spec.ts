import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';
import { jwtInterceptor } from './jwt.interceptor';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let token: string | null;

  function configure() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthStateService, useValue: { token: () => token } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  beforeEach(() => {
    token = null;
  });

  it('adiciona o header Authorization: Bearer quando há token', () => {
    token = 'jwt-abc';
    configure();

    http.get('/api/tasks').subscribe();
    const req = httpMock.expectOne('/api/tasks');

    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({});
  });

  it('não adiciona o header Authorization quando não há token', () => {
    token = null;
    configure();

    http.get('/api/tasks').subscribe();
    const req = httpMock.expectOne('/api/tasks');

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('não muta os demais headers da requisição original', () => {
    token = 'jwt-abc';
    configure();

    http.get('/api/tasks', { headers: { 'X-Custom': '1' } }).subscribe();
    const req = httpMock.expectOne('/api/tasks');

    expect(req.request.headers.get('X-Custom')).toBe('1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({});
  });
});
