import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ComprobanteEgreso, Egreso } from '../models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class EgresoApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Egreso[]> {
    return this.http.get<Egreso[]>(`${API}/egresos`);
  }
  obtener(id: number): Observable<Egreso> {
    return this.http.get<Egreso>(`${API}/egresos/${id}`);
  }
  listarPorFecha(fechaInicio: string, fechaFin: string): Observable<Egreso[]> {
    return this.http.get<Egreso[]>(`${API}/egresos/por-fecha`, {
      params: { fechaInicio, fechaFin }
    });
  }
  listarPorCategoria(categoria: string): Observable<Egreso[]> {
    return this.http.get<Egreso[]>(`${API}/egresos/por-categoria/${encodeURIComponent(categoria)}`);
  }
  registrar(egreso: Egreso): Observable<Egreso> {
    return this.http.post<Egreso>(`${API}/egresos`, egreso);
  }
  actualizar(id: number, egreso: Egreso): Observable<Egreso> {
    return this.http.put<Egreso>(`${API}/egresos/${id}`, egreso);
  }
  eliminar(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${API}/egresos/${id}`, { params: { usuarioId } });
  }
}

@Injectable({ providedIn: 'root' })
export class ComprobanteEgresoApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<ComprobanteEgreso[]> {
    return this.http.get<ComprobanteEgreso[]>(`${API}/comprobantes-egreso`);
  }
  obtener(id: number): Observable<ComprobanteEgreso> {
    return this.http.get<ComprobanteEgreso>(`${API}/comprobantes-egreso/${id}`);
  }
  listarPorMes(fechaInicio: string, fechaFin: string): Observable<ComprobanteEgreso[]> {
    return this.http.get<ComprobanteEgreso[]>(`${API}/comprobantes-egreso/por-mes`, {
      params: { fechaInicio, fechaFin }
    });
  }
  registrar(comprobante: ComprobanteEgreso): Observable<ComprobanteEgreso> {
    return this.http.post<ComprobanteEgreso>(`${API}/comprobantes-egreso`, comprobante);
  }
  anular(id: number, usuarioId: number): Observable<ComprobanteEgreso> {
    return this.http.patch<ComprobanteEgreso>(`${API}/comprobantes-egreso/${id}/anular`, null, {
      params: { usuarioId }
    });
  }
  procesar(id: number, usuarioId: number): Observable<ComprobanteEgreso> {
    return this.http.patch<ComprobanteEgreso>(`${API}/comprobantes-egreso/${id}/procesar`, null, {
      params: { usuarioId }
    });
  }
}

@Injectable({ providedIn: 'root' })
export class ReporteApi {
  private readonly http = inject(HttpClient);

  egresosPorFecha(fechaInicio: string, fechaFin: string): Observable<Blob> {
    return this.http.get(`${API}/reportes/egresos/por-fecha`, {
      params: { fechaInicio, fechaFin },
      responseType: 'blob'
    });
  }
  egresosPorCategoria(categoria: string): Observable<Blob> {
    return this.http.get(`${API}/reportes/egresos/por-categoria/${encodeURIComponent(categoria)}`, {
      responseType: 'blob'
    });
  }
  recibosDiario(fecha: string): Observable<Blob> {
    return this.http.get(`${API}/reportes/recibos/diario`, {
      params: { fecha },
      responseType: 'blob'
    });
  }
  recibosMensual(anio: number, mes: number): Observable<Blob> {
    return this.http.get(`${API}/reportes/recibos/mensual`, {
      params: { anio, mes },
      responseType: 'blob'
    });
  }
  socios(): Observable<Blob> {
    return this.http.get(`${API}/reportes/socios`, { responseType: 'blob' });
  }
  noSocios(): Observable<Blob> {
    return this.http.get(`${API}/reportes/no-socios`, { responseType: 'blob' });
  }
  bancos(): Observable<Blob> {
    return this.http.get(`${API}/reportes/bancos`, { responseType: 'blob' });
  }
}
