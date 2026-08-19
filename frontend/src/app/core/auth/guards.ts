import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { ToastService } from '../ui/toast.service';
import { AuthService } from './auth.service';

/** Todas las rutas del backend exigen JWT salvo el login. */
export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.autenticado() ? true : router.createUrlTree(['/login']);
};

/** RNF-02: /usuarios y /auditoria son exclusivos del Administrador. */
export const adminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  if (auth.esAdmin()) {
    return true;
  }
  toast.error('Solo el Administrador puede ingresar a esta seccion');
  return router.createUrlTree(['/inicio']);
};

/** Evita volver al login con una sesion abierta. */
export const invitadoGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.autenticado() ? router.createUrlTree(['/inicio']) : true;
};
