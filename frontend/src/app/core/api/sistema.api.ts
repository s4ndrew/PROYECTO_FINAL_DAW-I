import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Auditoria, Usuario } from '../models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class UsuarioApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API}/usuarios`);
  }
  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${API}/usuarios/${id}`);
  }
  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${API}/usuarios`, usuario);
  }
  editar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${API}/usuarios/${id}`, usuario);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/usuarios/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class AuditoriaApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Auditoria[]> {
    return this.http.get<Auditoria[]>(`${API}/auditoria`);
  }
  listarPorEntidad(entidad: string): Observable<Auditoria[]> {
    return this.http.get<Auditoria[]>(`${API}/auditoria/entidad/${encodeURIComponent(entidad)}`);
  }
  listarPorUsuario(usuarioId: number): Observable<Auditoria[]> {
    return this.http.get<Auditoria[]>(`${API}/auditoria/usuario/${usuarioId}`);
  }
}
