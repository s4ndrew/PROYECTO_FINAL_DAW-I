import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type TonoChip = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * Muestra los estados tal como los devuelve el backend
 * (PENDIENTE / ABONADA / EXONERADA, INGRESO / BANCO / EGRESO, etc.).
 * Siempre con texto: el color nunca es la unica senal.
 */
@Component({
  selector: 'fg-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="fg-chip fg-chip--{{ tono() }}">{{ etiqueta() }}</span>`
})
export class FgChip {
  readonly valor = input<string | boolean | null | undefined>(null);
  /** Permite forzar el tono cuando el valor no es un estado conocido. */
  readonly tonoManual = input<TonoChip | null>(null);

  readonly etiqueta = computed(() => {
    const v = this.valor();
    if (v === true) return 'ACTIVO';
    if (v === false) return 'INACTIVO';
    return v ? String(v) : '—';
  });

  readonly tono = computed<TonoChip>(() => this.tonoManual() ?? tonoDeEstado(this.etiqueta()));
}

export function tonoDeEstado(estado: string): TonoChip {
  switch (estado.toUpperCase()) {
    case 'ABONADA':
    case 'PAGADO':
    case 'ACTIVO':
    case 'PROCESADO':
      return 'success';
    case 'PENDIENTE':
    case 'REGISTRADO':
      return 'warning';
    case 'ANULADO':
      return 'danger';
    case 'INGRESO':
    case 'BANCO':
      return 'info';
    default:
      return 'neutral';
  }
}
