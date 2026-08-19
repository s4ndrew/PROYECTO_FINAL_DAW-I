import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CuentaCobrarApi, ReciboApi } from '../../core/api/caja.api';
import { PuestoApi, SocioApi } from '../../core/api/catalogos.api';
import { CuentaCobrar, Puesto, Recibo, Socio } from '../../core/models';
import { FgPageHeader } from '../../shared/ui/page-header';
import { FechaPipe } from '../../shared/ui/pipes';
import { Columna, FgTable } from '../../shared/ui/table';

/** Detalle del socio: RF-19 (deuda) y RF-26 (historial de pagos). */
@Component({
  selector: 'fg-socio-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FgPageHeader, FgTable, FechaPipe],
  template: `
    <fg-page-header
      [titulo]="socio() ? socio()!.nombre + ' ' + socio()!.apellidos : 'Socio'"
      descripcion="Datos del propietario, sus puestos, sus cuentas y sus recibos."
    >
      <a class="fg-btn fg-btn--secondary" routerLink="/socios">Volver</a>
    </fg-page-header>

    @if (socio(); as s) {
      <div class="fg-card fg-card__body resumen">
        <div><span class="fg-caption">Codigo</span><strong>{{ s.codigo }}</strong></div>
        <div><span class="fg-caption">Accion</span><strong>{{ s.accion }}</strong></div>
        <div><span class="fg-caption">Etapa</span><strong>{{ s.etapa }}</strong></div>
        <div>
          <span class="fg-caption">Fecha de nacimiento</span>
          <strong>{{ s.fechaNacimiento | fecha }}</strong>
        </div>
      </div>
    }

    <h2 class="titulo-seccion">Puestos del socio</h2>
    <div class="fg-card">
      <fg-table
        [columnas]="colPuestos"
        [filas]="puestos()"
        [cargando]="cargando()"
        [buscador]="false"
        vacioTitulo="Sin puestos asignados"
        vacioTexto="Este socio todavia no tiene ningun puesto a su nombre."
      >
        <ng-template #acciones let-puesto>
          <a class="fg-btn fg-btn--secondary fg-btn--sm" [routerLink]="['/puestos', puesto.id]">
            Ver
          </a>
        </ng-template>
      </fg-table>
    </div>

    <h2 class="titulo-seccion">Cuentas por cobrar</h2>
    <div class="fg-card">
      <fg-table
        [columnas]="colCuentas"
        [filas]="cuentas()"
        [cargando]="cargando()"
        [buscador]="false"
        vacioTitulo="Sin cuentas registradas"
        vacioTexto="No se han generado cargos para este socio."
      />
    </div>

    <h2 class="titulo-seccion">Recibos</h2>
    <div class="fg-card">
      <fg-table
        [columnas]="colRecibos"
        [filas]="recibos()"
        [cargando]="cargando()"
        [buscador]="false"
        vacioTitulo="Sin recibos"
        vacioTexto="Cuando el socio realice pagos, apareceran aqui."
      />
    </div>
  `,
  styles: [
    `
      .resumen {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: var(--fg-space-4);
      }
      .resumen div {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .titulo-seccion {
        margin: var(--fg-space-8) 0 var(--fg-space-3);
      }
      @media (max-width: 767px) {
        .resumen {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `
  ]
})
export class SocioDetallePage {
  private readonly socioApi = inject(SocioApi);
  private readonly puestoApi = inject(PuestoApi);
  private readonly cuentaApi = inject(CuentaCobrarApi);
  private readonly reciboApi = inject(ReciboApi);

  /** Viene de la ruta /socios/:id con withComponentInputBinding(). */
  readonly id = input.required<string>();

  protected readonly socio = signal<Socio | null>(null);
  protected readonly puestos = signal<Puesto[]>([]);
  protected readonly cuentas = signal<CuentaCobrar[]>([]);
  protected readonly recibos = signal<Recibo[]>([]);
  protected readonly cargando = signal(true);

  protected readonly colPuestos: Columna<Puesto>[] = [
    { header: 'Numero', value: (p) => p.numero },
    { header: 'Inquilino', value: (p) => p.inquilinoNombre },
    { header: 'Vigencia inicio', value: (p) => p.vigenciaInicio, tipo: 'fecha' },
    { header: 'Vigencia fin', value: (p) => p.vigenciaFin, tipo: 'fecha' }
  ];

  protected readonly colCuentas: Columna<CuentaCobrar>[] = [
    { header: 'Servicio', value: (c) => c.servicio?.nombre },
    { header: 'Periodo', value: (c) => c.periodo, tipo: 'periodo' },
    { header: 'Monto', value: (c) => c.monto, tipo: 'moneda', align: 'right' },
    { header: 'Estado', value: (c) => c.estado, tipo: 'chip' },
    { header: 'Generada', value: (c) => c.fechaGeneracion, tipo: 'fechaHora' }
  ];

  protected readonly colRecibos: Columna<Recibo>[] = [
    { header: 'Correlativo', value: (r) => r.correlativo },
    { header: 'Tipo', value: (r) => r.tipo, tipo: 'chip' },
    { header: 'Fecha', value: (r) => r.fecha, tipo: 'fechaHora' },
    { header: 'Concepto', value: (r) => r.concepto },
    { header: 'Monto', value: (r) => r.monto, tipo: 'moneda', align: 'right' }
  ];

  ngOnInit(): void {
    const socioId = Number(this.id());
    forkJoin({
      socio: this.socioApi.obtener(socioId),
      puestos: this.puestoApi.listar(),
      cuentas: this.cuentaApi.listarPorSocio(socioId),
      recibos: this.reciboApi.listarPorSocio(socioId)
    }).subscribe({
      next: ({ socio, puestos, cuentas, recibos }) => {
        this.socio.set(socio);
        this.puestos.set(puestos.filter((p) => p.socioId === socioId));
        this.cuentas.set(cuentas);
        this.recibos.set(recibos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
