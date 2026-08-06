import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStateService).token();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
