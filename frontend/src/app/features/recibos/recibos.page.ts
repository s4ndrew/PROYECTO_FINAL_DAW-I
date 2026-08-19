import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReciboApi } from '../../core/api/caja.api';
import { Recibo } from '../../core/models';
import { hoyIso } from '../../core/util/formato';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { FechaHoraPipe, FechaPipe, MonedaPipe } from '../../shared/ui/pipes';
import { Columna, FgTable } from '../../shared/ui/table';

type ModoLista = 'todos' | 'ingresos' | 'bancarios';

@Component({
  selector: 'fg-recibos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FgPageHeader, FgTable, FgModal, MonedaPipe, FechaPipe, FechaHoraPipe],
  template: `
    <fg-page-header titulo="Recibos" descripcion="Comprobantes de caja emitidos por la galeria.">
      <a class="fg-btn fg-btn--secondary" routerLink="/recibos/canje">Canje bancario</a>
      <a class="fg-btn fg-btn--primary" routerLink="/recibos/ingreso-externo">Ingreso externo</a>
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="recibos()"
        [cargando]="cargando()"
        [tieneFiltros]="true"
        [tamanioPagina]="15"
        placeholder="Buscar por concepto, socio o puesto..."
        vacioTitulo="Todavia no hay recibos"
        vacioTexto="Los recibos apareceran aqui cuando se registren pagos o ingresos."
      >
        <select
          tablaFiltros
          class="fg-select"
          style="max-width:220px"
          aria-label="Tipo de listado"
          [value]="modo()"
          (change)="cambiarModo($any($event.target).value)"
        >
          <option value="todos">Todos los recibos</option>
          <option value="ingresos">Ingresos por fecha</option>
          <option value="bancarios">Bancarios por fecha</option>
        </select>
        @if (modo() !== 'todos') {
          <input
            tablaFiltros
            class="fg-input"
            style="max-width:170px"
            type="date"
            aria-label="Fecha"
            [value]="fecha()"
            (change)="cambiarFecha($any($event.target).value)"
          />
        }

        <ng-template #acciones let-recibo>
          <button
            type="button"
            class="fg-btn fg-btn--secondary fg-btn--sm"
            (click)="detalle.set(recibo)"
          >
            Ver detalle
          </button>
        </ng-template>
      </fg-table>
    </div>

    @if (detalle(); as recibo) {
      <fg-modal [titulo]="'Recibo N° ' + recibo.correlativo" (cerrar)="detalle.set(null)">
        <div class="detalle">
          <div><span class="fg-caption">Tipo</span><strong>{{ recibo.tipo }}</strong></div>
          <div>
            <span class="fg-caption">Fecha</span><strong>{{ recibo.fecha | fechaHora }}</strong>
          </div>
          <div>
            <span class="fg-caption">Monto</span>
            <strong>{{ recibo.monto | moneda }}</strong>
          </div>
          <div>
            <span class="fg-caption">Socio</span>
            <strong>
              {{ recibo.socio ? recibo.socio.nombre + ' ' + recibo.socio.apellidos : '—' }}
            </strong>
          </div>
          <div>
            <span class="fg-caption">Puesto</span>
            <strong>{{ recibo.puesto?.numero || '—' }}</strong>
          </div>
          <div>
            <span class="fg-caption">Banco</span>
            <strong>{{ recibo.banco?.nombre || '—' }}</strong>
          </div>
          <div>
            <span class="fg-caption">Fecha de deposito</span>
            <strong>{{ recibo.fechaDeposito | fecha }}</strong>
          </div>
          <div>
            <span class="fg-caption">Depositante</span>
            <strong>{{ recibo.depositante || '—' }}</strong>
          </div>
          <div>
            <span class="fg-caption">Categoria</span>
            <strong>{{ recibo.categoria || '—' }}</strong>
          </div>
          <div>
            <span class="fg-caption">Registrado por</span>
            <strong>
              {{ recibo.usuario ? recibo.usuario.nombres + ' ' + recibo.usuario.apellidos : '—' }}
            </strong>
          </div>
          <div class="ancho-total">
            <span class="fg-caption">Concepto</span>
            <strong>{{ recibo.concepto || '—' }}</strong>
          </div>
        </div>
        <p class="fg-caption" style="margin-top:12px">
          No se guarda el detalle de que cuentas salda cada recibo, solo el monto total.
        </p>
        <div modalFooter>
          <button type="button" class="fg-btn fg-btn--ghost" (click)="detalle.set(null)">
            Cerrar
          </button>
        </div>
      </fg-modal>
    }
  `,
  styles: [
    `
      .detalle {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--fg-space-4);
      }
      .detalle div {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .detalle .ancho-total {
        grid-column: 1 / -1;
      }
      @media (max-width: 575px) {
        .detalle {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class RecibosPage {
  private readonly api = inject(ReciboApi);

  protected readonly recibos = signal<Recibo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly modo = signal<ModoLista>('todos');
  protected readonly fecha = signal(hoyIso());
  protected readonly detalle = signal<Recibo | null>(null);

  protected readonly columnas: Columna<Recibo>[] = [
    { header: 'Correlativo', value: (r) => r.correlativo },
    { header: 'Tipo', value: (r) => r.tipo, tipo: 'chip' },
    { header: 'Fecha', value: (r) => r.fecha, tipo: 'fechaHora' },
    {
      header: 'Socio',
      value: (r) => (r.socio ? `${r.socio.nombre} ${r.socio.apellidos}` : null)
    },
    { header: 'Puesto', value: (r) => r.puesto?.numero },
    { header: 'Concepto', value: (r) => r.concepto },
    { header: 'Monto', value: (r) => r.monto, tipo: 'moneda', align: 'right' }
  ];

  constructor() {
    this.cargar();
  }

  protected cambiarModo(modo: ModoLista): void {
    this.modo.set(modo);
    this.cargar();
  }

  protected cambiarFecha(fecha: string): void {
    this.fecha.set(fecha);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    const peticion =
      this.modo() === 'ingresos'
        ? this.api.listarIngresosPorFecha(this.fecha())
        : this.modo() === 'bancarios'
          ? this.api.listarBancariosPorFecha(this.fecha())
          : this.api.listar();

    peticion.subscribe({
      next: (recibos) => {
        this.recibos.set(recibos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
