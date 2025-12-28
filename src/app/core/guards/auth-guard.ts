import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

// 1. Proteger Dashboard: Solo deja pasar si está autenticado
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkStatus().pipe(
    tap(isAuth => {
      if (!isAuth) router.navigate(['/auth/login']);
    })
  );
};