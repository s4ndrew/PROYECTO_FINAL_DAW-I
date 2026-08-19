import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Banco, Giro, Puesto, Servicio, Socio } from '../models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class SocioApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Socio[]> {
    return this.http.get<Socio[]>(`${API}/socios`);
  }
  obtener(id: number): Observable<Socio> {
    return this.http.get<Socio>(`${API}/socios/${id}`);
  }
  buscar(texto: string): Observable<Socio[]> {
    return this.http.get<Socio[]>(`${API}/socios/buscar`, { params: { texto } });
  }
  crear(socio: Socio): Observable<Socio> {
    return this.http.post<Socio>(`${API}/socios`, socio);
  }
  editar(id: number, socio: Socio): Observable<Socio> {
    return this.http.put<Socio>(`${API}/socios/${id}`, socio);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/socios/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class GiroApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Giro[]> {
    return this.http.get<Giro[]>(`${API}/giros`);
  }
  obtener(id: number): Observable<Giro> {
    return this.http.get<Giro>(`${API}/giros/${id}`);
  }
  crear(giro: Giro): Observable<Giro> {
    return this.http.post<Giro>(`${API}/giros`, giro);
  }
  editar(id: number, giro: Giro): Observable<Giro> {
    return this.http.put<Giro>(`${API}/giros/${id}`, giro);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/giros/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class PuestoApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Puesto[]> {
    return this.http.get<Puesto[]>(`${API}/puestos`);
  }
  obtener(id: number): Observable<Puesto> {
    return this.http.get<Puesto>(`${API}/puestos/${id}`);
  }
  buscar(numero: string): Observable<Puesto[]> {
    return this.http.get<Puesto[]>(`${API}/puestos/buscar`, { params: { numero } });
  }
  crear(puesto: Puesto): Observable<Puesto> {
    return this.http.post<Puesto>(`${API}/puestos`, puesto);
  }
  editar(id: number, puesto: Puesto): Observable<Puesto> {
    return this.http.put<Puesto>(`${API}/puestos/${id}`, puesto);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/puestos/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class BancoApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Banco[]> {
    return this.http.get<Banco[]>(`${API}/bancos`);
  }
  obtener(id: number): Observable<Banco> {
    return this.http.get<Banco>(`${API}/bancos/${id}`);
  }
  crear(banco: Banco): Observable<Banco> {
    return this.http.post<Banco>(`${API}/bancos`, banco);
  }
  editar(id: number, banco: Banco): Observable<Banco> {
    return this.http.put<Banco>(`${API}/bancos/${id}`, banco);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/bancos/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ServicioApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${API}/servicios`);
  }
  listarActivos(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${API}/servicios/activos`);
  }
  obtener(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${API}/servicios/${id}`);
  }
  crear(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(`${API}/servicios`, servicio);
  }
  editar(id: number, servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${API}/servicios/${id}`, servicio);
  }
  cambiarEstado(id: number, activo: boolean): Observable<Servicio> {
    return this.http.patch<Servicio>(`${API}/servicios/${id}/estado`, null, {
      params: { activo }
    });
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/servicios/${id}`);
  }
}
