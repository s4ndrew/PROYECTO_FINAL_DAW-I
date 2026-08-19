import { Pipe, PipeTransform } from '@angular/core';

import {
  formatearFecha,
  formatearFechaHora,
  formatearMoneda,
  formatearPeriodo
} from '../../core/util/formato';

@Pipe({ name: 'moneda' })
export class MonedaPipe implements PipeTransform {
  transform(valor: number | null | undefined, moneda = 'PEN'): string {
    return formatearMoneda(valor, moneda);
  }
}

@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatearFecha(valor);
  }
}

@Pipe({ name: 'fechaHora' })
export class FechaHoraPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatearFechaHora(valor);
  }
}

@Pipe({ name: 'periodo' })
export class PeriodoPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatearPeriodo(valor);
  }
}
