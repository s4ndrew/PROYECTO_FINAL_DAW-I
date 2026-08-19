import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CanjeBancarioRequest,
  CuentaCobrar,
  GenerarConsumoRequest,
  GenerarCuentasPuestoRequest,
  GenerarSociosRequest,
  IngresoExternoRequest,
  PagoRequest,
  Recibo
} from '../models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CuentaCobrarApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<CuentaCobrar[]> {
    return this.http.get<CuentaCobrar[]>(`${API}/cuentas-cobrar`);
  }
  obtener(id: number): Observable<CuentaCobrar> {
    return this.http.get<CuentaCobrar>(`${API}/cuentas-cobrar/${id}`);
  }
  listarPorSocio(socioId: number): Observable<CuentaCobrar[]> {
    return this.http.get<CuentaCobrar[]>(`${API}/cuentas-cobrar/socio/${socioId}`);
  }
  listarPorPuesto(puestoId: number): Observable<CuentaCobrar[]> {
    return this.http.get<CuentaCobrar[]>(`${API}/cuentas-cobrar/puesto/${puestoId}`);
  }
  generarParaPuestos(request: GenerarCuentasPuestoRequest): Observable<CuentaCobrar[]> {
    return this.http.post<CuentaCobrar[]>(`${API}/cuentas-cobrar/generar/puestos`, request);
  }
  generarPorConsumo(request: GenerarConsumoRequest): Observable<CuentaCobrar> {
    return this.http.post<CuentaCobrar>(`${API}/cuentas-cobrar/generar/consumo`, request);
  }
  generarParaSocios(request: GenerarSociosRequest): Observable<CuentaCobrar[]> {
    return this.http.post<CuentaCobrar[]>(`${API}/cuentas-cobrar/generar/socios`, request);
  }
  marcarAbonada(id: number): Observable<CuentaCobrar> {
    return this.http.patch<CuentaCobrar>(`${API}/cuentas-cobrar/${id}/abonar`, null);
  }
  marcarExonerada(id: number): Observable<CuentaCobrar> {
    return this.http.patch<CuentaCobrar>(`${API}/cuentas-cobrar/${id}/exonerar`, null);
  }
  anular(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${API}/cuentas-cobrar/${id}`, { params: { usuarioId } });
  }
}

@Injectable({ providedIn: 'root' })
export class ReciboApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Recibo[]> {
    return this.http.get<Recibo[]>(`${API}/recibos`);
  }
  obtener(id: number): Observable<Recibo> {
    return this.http.get<Recibo>(`${API}/recibos/${id}`);
  }
  listarPorSocio(socioId: number): Observable<Recibo[]> {
    return this.http.get<Recibo[]>(`${API}/recibos/socio/${socioId}`);
  }
  listarPorPuesto(puestoId: number): Observable<Recibo[]> {
    return this.http.get<Recibo[]>(`${API}/recibos/puesto/${puestoId}`);
  }
  listarIngresosPorFecha(fecha: string): Observable<Recibo[]> {
    return this.http.get<Recibo[]>(`${API}/recibos/ingresos`, { params: { fecha } });
  }
  listarBancariosPorFecha(fecha: string): Observable<Recibo[]> {
    return this.http.get<Recibo[]>(`${API}/recibos/bancarios`, { params: { fecha } });
  }
  procesarPago(request: PagoRequest): Observable<Recibo> {
    return this.http.post<Recibo>(`${API}/recibos/pagos`, request);
  }
  canjear(request: CanjeBancarioRequest): Observable<Recibo> {
    return this.http.post<Recibo>(`${API}/recibos/canjes`, request);
  }
  registrarIngresoExterno(request: IngresoExternoRequest): Observable<Recibo> {
    return this.http.post<Recibo>(`${API}/recibos/ingresos-externos`, request);
  }
}
