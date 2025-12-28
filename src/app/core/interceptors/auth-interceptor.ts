import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
 // Clonamos la petición para añadirle la configuración de credenciales
  const authReq = req.clone({
    withCredentials: true
  });

  // Pasamos la petición clonada al siguiente paso
  return next(authReq);
};
