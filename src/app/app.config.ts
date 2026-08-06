import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { TaskRepositoryPort } from '@application/task/ports/task-repository.port';
import { AuthRepositoryPort } from '@application/auth/ports/auth-repository.port';
import { TaskHttpAdapter } from '@infrastructure/http/task-http.adapter';
import { AuthHttpAdapter } from '@infrastructure/http/auth-http.adapter';
import { jwtInterceptor } from '@infrastructure/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    { provide: TaskRepositoryPort, useClass: TaskHttpAdapter },
    { provide: AuthRepositoryPort, useClass: AuthHttpAdapter },
  ],
};
