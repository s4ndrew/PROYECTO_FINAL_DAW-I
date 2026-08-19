
export type Rol = 'ADMIN' | 'OPERADOR';
export type EstadoCuenta = 'PENDIENTE' | 'ABONADA' | 'EXONERADA';
export type TipoRecibo = 'INGRESO' | 'BANCO' | 'EGRESO';
export type TipoCosto = 'FIJO' | 'CONSUMO';
export type DestinoCargo = 'SOCIO' | 'PUESTO';

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  rol: Rol;
}

export interface Usuario {
  id?: number;
  usuario: string;
  password?: string | null;
  nombres: string;
  apellidos: string;
  rol: Rol;
  activo: boolean;
}

export interface Socio {
  id?: number;
  codigo: string;
  nombre: string;
  apellidos: string;
  accion: string;
  etapa: string;
  fechaNacimiento: string;
}

export interface Giro {
  id?: number;
  nombre: string;
  descripcion?: string | null;
}

export interface Puesto {
  id?: number;
  numero: string;
  socioId?: number | null;
  giroId: number | null;
  inquilinoNombre?: string | null;
  inquilinoDocumento?: string | null;
  vigenciaInicio?: string | null;
  vigenciaFin?: string | null;
}

export interface Banco {
  id?: number;
  nombre: string;
  numeroCuenta?: string | null;
  cci?: string | null;
  moneda: string;
}

export interface Servicio {
  id?: number;
  nombre: string;
  recurrencia: string;
  moneda: string;
  costo: number | null;
  destinoCargo: DestinoCargo | null;
  tipoCosto: TipoCosto | null;
  costoUnitario?: number | null;
  estado: boolean;
}

export interface CuentaCobrar {
  id: number;
  servicio?: Servicio | null;
  socio?: Socio | null;
  puesto?: Puesto | null;
  periodo: string;
  lecturaInicial?: number | null;
  lecturaFinal?: number | null;
  monto: number;
  estado: EstadoCuenta;
  fechaGeneracion: string;
}

export interface Recibo {
  id: number;
  tipo: TipoRecibo;
  correlativo: number;
  fecha: string;
  monto: number;
  socio?: Socio | null;
  puesto?: Puesto | null;
  banco?: Banco | null;
  usuario?: Usuario | null;
  concepto?: string | null;
  categoria?: string | null;
  depositante?: string | null;
  fechaDeposito?: string | null;
}

export interface Egreso {
  id?: number;
  tipo?: string | null;
  correlativo?: number | null;
  proveedor: string;
  fecha: string;
  subtotal?: number | null;
  igv?: number | null;
  total: number;
  motivo?: string | null;
  categoria?: string | null;
  bancoId?: number | null;
  usuarioId?: number | null;
}

export interface ComprobanteEgreso {
  id?: number;
  numero: string;
  fechaEmision: string;
  monto: number;
  estado?: string | null;
  egresoId: number | null;
  usuarioId?: number | null;
}

export interface Auditoria {
  id: number;
  usuarioId: number;
  usuarioNombre?: string | null;
  fecha: string;
  entidad: string;
  entidadId?: number | null;
  accion: string;
  detalle?: string | null;
}

export interface PagoRequest {
  cuentaIds: number[];
  usuarioId: number;
}

export interface CanjeBancarioRequest {
  cuentaId: number;
  bancoId: number;
  fechaDeposito: string;
  usuarioId: number;
}

export interface IngresoExternoRequest {
  depositante: string;
  categoria: string;
  concepto: string;
  monto: number;
  usuarioId: number;
}

export interface GenerarCuentasPuestoRequest {
  servicioId: number;
  puestoIds: number[];
  periodo: string;
}

export interface GenerarConsumoRequest {
  servicioId: number;
  puestoId: number;
  periodo: string;
  lecturaInicial: number;
  lecturaFinal: number;
}

export interface GenerarSociosRequest {
  servicioId: number;
  periodo: string;
  etapas: string[];
  soloUnicos: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  mensaje: string;
  errores?: Record<string, string>;
}
