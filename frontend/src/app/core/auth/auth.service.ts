import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Rol } from '../models';

const STORAGE_KEY = 'fg.sesion';

export interface Sesion {
  token: string;
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  rol: Rol;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sesionSignal = signal<Sesion | null>(leerSesion());

  readonly sesion = this.sesionSignal.asReadonly();
  readonly autenticado = computed(() => this.sesionSignal() !== null);
  readonly esAdmin = computed(() => this.sesionSignal()?.rol === 'ADMIN');
  readonly nombreCompleto = computed(() => {
    const s = this.sesionSignal();
    return s ? `${s.nombres} ${s.apellidos}`.trim() : '';
  });

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/usuarios/login`, request)
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  logout(redirigir = true): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sesionSignal.set(null);
    if (redirigir) {
      void this.router.navigate(['/login']);
    }
  }

  token(): string | null {
    return this.sesionSignal()?.token ?? null;
  }

  tokenVencido(): boolean {
    const token = this.token();
    if (!token) {
      return true;
    }
    const exp = leerExpiracion(token);
    return exp === null ? false : exp * 1000 <= Date.now();
  }

  usuarioId(): number {
    const id = this.sesionSignal()?.id;
    if (id === undefined) {
      throw new Error('No hay sesion activa');
    }
    return id;
  }

  private guardarSesion(respuesta: LoginResponse): void {
    const sesion: Sesion = {
      token: respuesta.token,
      id: respuesta.id,
      usuario: respuesta.usuario,
      nombres: respuesta.nombres,
      apellidos: respuesta.apellidos,
      rol: respuesta.rol
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
    this.sesionSignal.set(sesion);
  }
}

function leerExpiracion(token: string): number | null {
  try {
    const carga = token.split('.')[1];
    if (!carga) {
      return null;
    }
    const json = atob(carga.replace(/-/g, '+').replace(/_/g, '/'));
    const datos = JSON.parse(json) as { exp?: number };
    return typeof datos.exp === 'number' ? datos.exp : null;
  } catch {
    return null;
  }
}

function leerSesion(): Sesion | null {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY);
    return crudo ? (JSON.parse(crudo) as Sesion) : null;
  } catch {
    return null;
  }
}
