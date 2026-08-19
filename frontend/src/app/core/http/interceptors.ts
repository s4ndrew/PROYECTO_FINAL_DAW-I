import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { ApiError } from '../models';
import { ToastService } from '../ui/toast.service';

/** Agrega el Bearer a todo, menos al login (unico permitAll del backend). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const esLogin = req.url.endsWith('/usuarios/login');

  if (!token || esLogin) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

/**
 * Traduce el JSON de GlobalExceptionHandler
 * ({ timestamp, status, mensaje, errores }) a toasts y manejo de sesion.
 * Los 400 con `errores` se dejan pasar para que el formulario marque los campos.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  const cerrarSesionVencida = (): void => {
    toast.warning('Tu sesion expiro', 'Vuelve a iniciar sesion para continuar');
    auth.logout();
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const cuerpo = leerCuerpo(error);
      const mensaje = cuerpo?.mensaje;

      switch (error.status) {
        case 0:
          toast.error(
            'No se pudo conectar con el servidor',
            'Verifica que el backend este corriendo en http://localhost:8080'
          );
          break;
        case 400:
          if (!cuerpo?.errores) {
            toast.error('Datos invalidos', mensaje);
          }
          break;
        case 401:
          if (req.url.endsWith('/usuarios/login')) {
            toast.error('No se pudo iniciar sesion', mensaje ?? 'Usuario o password incorrectos');
          } else {
            cerrarSesionVencida();
          }
          break;
        case 403:
          // El backend devuelve 403 tanto para "rol insuficiente" como para
          // "token ausente o vencido" (no hay AuthenticationEntryPoint), asi
          // que se distingue revisando la expiracion del propio token.
          if (auth.tokenVencido()) {
            cerrarSesionVencida();
          } else {
            toast.error('No tiene permisos para realizar esta accion');
          }
          break;
        case 404:
          toast.error('No encontrado', mensaje ?? 'El recurso solicitado no existe');
          break;
        case 409:
          toast.error(
            'Operacion rechazada',
            mensaje ?? 'La operacion viola una restriccion de datos'
          );
          break;
        default:
          toast.error('Ocurrio un error inesperado', mensaje);
      }

      return throwError(() => error);
    })
  );
};

function leerCuerpo(error: HttpErrorResponse): ApiError | null {
  // Las descargas XLSX usan responseType blob: el cuerpo del error no es JSON legible.
  if (!error.error || error.error instanceof Blob || typeof error.error === 'string') {
    return null;
  }
  return error.error as ApiError;
}
