import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CuentaCobrarApi, ReciboApi } from '../../core/api/caja.api';
import { GiroApi, PuestoApi, SocioApi } from '../../core/api/catalogos.api';
import { CuentaCobrar, Puesto, Recibo } from '../../core/models';
import { FgPageHeader } from '../../shared/ui/page-header';
import { FechaPipe } from '../../shared/ui/pipes';
import { Columna, FgTable } from '../../shared/ui/table';

@Component({
  selector: 'fg-puesto-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FgPageHeader, FgTable, FechaPipe],
  template: `
    <fg-page-header
      [titulo]="puesto() ? 'Puesto ' + puesto()!.numero : 'Puesto'"
      descripcion="Datos del modulo, sus cuentas por cobrar y sus recibos."
    >
      <a class="fg-btn fg-btn--secondary" routerLink="/puestos">Volver</a>
    </fg-page-header>

    @if (puesto(); as p) {
      <div class="fg-card fg-card__body resumen">
        <div><span class="fg-caption">Giro</span><strong>{{ giro() }}</strong></div>
        <div><span class="fg-caption">Socio</span><strong>{{ socio() }}</strong></div>
        <div>
          <span class="fg-caption">Inquilino</span>
          <strong>{{ p.inquilinoNombre || '—' }}</strong>
        </div>
        <div>
          <span class="fg-caption">Documento</span>
          <strong>{{ p.inquilinoDocumento || '—' }}</strong>
        </div>
        <div>
          <span class="fg-caption">Vigencia inicio</span>
          <strong>{{ p.vigenciaInicio | fecha }}</strong>
        </div>
        <div>
          <span class="fg-caption">Vigencia fin</span>
          <strong>{{ p.vigenciaFin | fecha }}</strong>
        </div>
      </div>
    }

    <h2 class="titulo-seccion">Cuentas por cobrar</h2>
    <div class="fg-card">
      <fg-table
        [columnas]="colCuentas"
        [filas]="cuentas()"
        [cargando]="cargando()"
        [buscador]="false"
        vacioTitulo="Sin cuentas registradas"
        vacioTexto="No se han generado cargos para este puesto."
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
        vacioTexto="Cuando se cobren cuentas de este puesto, apareceran aqui."
      />
    </div>
  `,
  styles: [
    `
      .resumen {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
export class PuestoDetallePage {
  private readonly puestoApi = inject(PuestoApi);
  private readonly socioApi = inject(SocioApi);
  private readonly giroApi = inject(GiroApi);
  private readonly cuentaApi = inject(CuentaCobrarApi);
  private readonly reciboApi = inject(ReciboApi);

  readonly id = input.required<string>();

  protected readonly puesto = signal<Puesto | null>(null);
  protected readonly giro = signal('—');
  protected readonly socio = signal('—');
  protected readonly cuentas = signal<CuentaCobrar[]>([]);
  protected readonly recibos = signal<Recibo[]>([]);
  protected readonly cargando = signal(true);

  protected readonly colCuentas: Columna<CuentaCobrar>[] = [
    { header: 'Servicio', value: (c) => c.servicio?.nombre },
    { header: 'Periodo', value: (c) => c.periodo, tipo: 'periodo' },
    { header: 'Lectura inicial', value: (c) => c.lecturaInicial, align: 'right' },
    { header: 'Lectura final', value: (c) => c.lecturaFinal, align: 'right' },
    { header: 'Monto', value: (c) => c.monto, tipo: 'moneda', align: 'right' },
    { header: 'Estado', value: (c) => c.estado, tipo: 'chip' }
  ];

  protected readonly colRecibos: Columna<Recibo>[] = [
    { header: 'Correlativo', value: (r) => r.correlativo },
    { header: 'Tipo', value: (r) => r.tipo, tipo: 'chip' },
    { header: 'Fecha', value: (r) => r.fecha, tipo: 'fechaHora' },
    { header: 'Concepto', value: (r) => r.concepto },
    { header: 'Monto', value: (r) => r.monto, tipo: 'moneda', align: 'right' }
  ];

  ngOnInit(): void {
    const puestoId = Number(this.id());
    forkJoin({
      puesto: this.puestoApi.obtener(puestoId),
      cuentas: this.cuentaApi.listarPorPuesto(puestoId),
      recibos: this.reciboApi.listarPorPuesto(puestoId),
      giros: this.giroApi.listar(),
      socios: this.socioApi.listar()
    }).subscribe({
      next: ({ puesto, cuentas, recibos, giros, socios }) => {
        this.puesto.set(puesto);
        this.cuentas.set(cuentas);
        this.recibos.set(recibos);
        this.giro.set(giros.find((g) => g.id === puesto.giroId)?.nombre ?? '—');
        const socio = socios.find((s) => s.id === puesto.socioId);
        this.socio.set(socio ? `${socio.nombre} ${socio.apellidos}` : '—');
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
