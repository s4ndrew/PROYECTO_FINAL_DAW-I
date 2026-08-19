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

/** RF-16 a RF-21, RN-05, RN-06. */
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
  /** RF-16: solo servicios con tipoCosto FIJO. */
  generarParaPuestos(request: GenerarCuentasPuestoRequest): Observable<CuentaCobrar[]> {
    return this.http.post<CuentaCobrar[]>(`${API}/cuentas-cobrar/generar/puestos`, request);
  }
  /** RF-17 / RN-05: el backend calcula el monto con las lecturas. */
  generarPorConsumo(request: GenerarConsumoRequest): Observable<CuentaCobrar> {
    return this.http.post<CuentaCobrar>(`${API}/cuentas-cobrar/generar/consumo`, request);
  }
  /** RF-18 / RN-06. */
  generarParaSocios(request: GenerarSociosRequest): Observable<CuentaCobrar[]> {
    return this.http.post<CuentaCobrar[]>(`${API}/cuentas-cobrar/generar/socios`, request);
  }
  marcarAbonada(id: number): Observable<CuentaCobrar> {
    return this.http.patch<CuentaCobrar>(`${API}/cuentas-cobrar/${id}/abonar`, null);
  }
  marcarExonerada(id: number): Observable<CuentaCobrar> {
    return this.http.patch<CuentaCobrar>(`${API}/cuentas-cobrar/${id}/exonerar`, null);
  }
  /** RNF-14: queda auditado con el usuario que anula. */
  anular(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${API}/cuentas-cobrar/${id}`, { params: { usuarioId } });
  }
}

/** RF-19 a RF-26, RF-29, RF-31. */
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
  /** RF-29. */
  listarIngresosPorFecha(fecha: string): Observable<Recibo[]> {
    return this.http.get<Recibo[]>(`${API}/recibos/ingresos`, { params: { fecha } });
  }
  /** RF-31. */
  listarBancariosPorFecha(fecha: string): Observable<Recibo[]> {
    return this.http.get<Recibo[]>(`${API}/recibos/bancarios`, { params: { fecha } });
  }
  /** RF-21 a RF-23: marca las cuentas y emite el recibo en una sola transaccion. */
  procesarPago(request: PagoRequest): Observable<Recibo> {
    return this.http.post<Recibo>(`${API}/recibos/pagos`, request);
  }
  /** RF-24: solo cuentas de socio. */
  canjear(request: CanjeBancarioRequest): Observable<Recibo> {
    return this.http.post<Recibo>(`${API}/recibos/canjes`, request);
  }
  /** RF-25. */
  registrarIngresoExterno(request: IngresoExternoRequest): Observable<Recibo> {
    return this.http.post<Recibo>(`${API}/recibos/ingresos-externos`, request);
  }
}
