import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { map } from 'rxjs';

// 2. Proteger Login: Si ya está logueado, no lo dejes entrar al login
export const publicGuard: CanActivateFn = (route, state) => {
 const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkStatus().pipe(
    map(isAuth => {
      if (isAuth) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};