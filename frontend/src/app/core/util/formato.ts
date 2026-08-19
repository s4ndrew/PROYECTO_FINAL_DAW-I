import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../models';

const MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Oct',
  'Nov',
  'Dic'
];

/** S/ 1,250.00 — el backend maneja PEN por defecto. */
export function formatearMoneda(valor: number | null | undefined, moneda = 'PEN'): string {
  if (valor === null || valor === undefined) {
    return '—';
  }
  try {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda }).format(valor);
  } catch {
    return `${moneda} ${valor.toFixed(2)}`;
  }
}

/** '2026-08-16' -> '16/08/2026'. */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const [fecha] = iso.split('T');
  const [anio, mes, dia] = fecha.split('-');
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : iso;
}

/** '2026-08-16T14:35:00' -> '16 Ago 2026 · 14:35'. */
export function formatearFechaHora(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const [fecha, hora = ''] = iso.split('T');
  const [anio, mes, dia] = fecha.split('-');
  const etiquetaMes = MESES[Number(mes) - 1] ?? mes;
  const hhmm = hora.slice(0, 5);
  return hhmm ? `${dia} ${etiquetaMes} ${anio} · ${hhmm}` : `${dia} ${etiquetaMes} ${anio}`;
}

/** Fecha de hoy en el formato que espera @DateTimeFormat(ISO.DATE). */
export function hoyIso(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${dosDigitos(hoy.getMonth() + 1)}-${dosDigitos(hoy.getDate())}`;
}

/** Periodo 'yyyy-MM' del mes actual. */
export function periodoActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${dosDigitos(hoy.getMonth() + 1)}`;
}

/** '2026-08' -> 'Agosto 2026'. */
export function formatearPeriodo(periodo: string | null | undefined): string {
  if (!periodo) {
    return '—';
  }
  const [anio, mes] = periodo.split('-');
  const nombres = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Setiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];
  const nombre = nombres[Number(mes) - 1];
  return nombre ? `${nombre} ${anio}` : periodo;
}

/** Dispara la descarga de un XLSX del backend con el nombre que define el front. */
export function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

/**
 * Traslada los errores de Bean Validation (400 con mapa `errores`) a los
 * controles del formulario, para que el usuario los vea campo por campo.
 * Devuelve true si el error se pudo aplicar.
 */
export function aplicarErroresServidor(form: FormGroup, error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) {
    return false;
  }
  const cuerpo = error.error as ApiError | null;
  if (!cuerpo?.errores) {
    return false;
  }
  let aplicado = false;
  for (const [campo, mensaje] of Object.entries(cuerpo.errores)) {
    const control = form.get(campo);
    if (control) {
      control.setErrors({ servidor: mensaje });
      control.markAsTouched();
      aplicado = true;
    }
  }
  return aplicado;
}

/** Primer mensaje de error legible de un control. */
export function mensajeDeError(errores: Record<string, unknown> | null | undefined): string {
  if (!errores) {
    return '';
  }
  if (typeof errores['servidor'] === 'string') {
    return errores['servidor'] as string;
  }
  if (errores['required']) {
    return 'Este campo es obligatorio.';
  }
  if (errores['email']) {
    return 'Ingresa un correo valido.';
  }
  if (errores['min']) {
    const min = errores['min'] as { min: number };
    return `El valor minimo es ${min.min}.`;
  }
  if (errores['minlength']) {
    const info = errores['minlength'] as { requiredLength: number };
    return `Debe tener al menos ${info.requiredLength} caracteres.`;
  }
  if (errores['maxlength']) {
    const info = errores['maxlength'] as { requiredLength: number };
    return `No puede superar los ${info.requiredLength} caracteres.`;
  }
  if (errores['pattern']) {
    return 'El formato no es valido.';
  }
  return 'Revisa este campo.';
}

function dosDigitos(valor: number): string {
  return valor.toString().padStart(2, '0');
}
