import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { CuentaCobrarApi, ReciboApi } from '../../core/api/caja.api';
import { PuestoApi, SocioApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { CuentaCobrar, Puesto, Recibo, Socio } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgPageHeader } from '../../shared/ui/page-header';
import { FechaHoraPipe, MonedaPipe } from '../../shared/ui/pipes';
import { Columna, FgTable } from '../../shared/ui/table';

/**
 * RF-21 a RF-23: se eligen cuentas pendientes de un socio o un puesto y el
 * backend las marca ABONADA y emite un unico recibo con correlativo, todo en
 * la misma transaccion (RNF-04, RNF-05).
 */
@Component({
  selector: 'fg-cobranza',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    FgPageHeader,
    FgTable,
    FgConfirm,
    MonedaPipe,
    FechaHoraPipe
  ],
  template: `
    <fg-page-header
      titulo="Cobranza"
      descripcion="Selecciona las cuentas pendientes y emite el recibo de pago."
    />

    <div class="fg-card fg-card__body selector">
      <div class="fg-field">
        <span class="fg-label">Buscar deuda por</span>
        <div class="fg-row">
          <label class="fg-check">
            <input type="radio" name="modo" value="socio" [(ngModel)]="modo" (change)="limpiar()" />
            Socio
          </label>
          <label class="fg-check">
            <input
              type="radio"
              name="modo"
              value="puesto"
              [(ngModel)]="modo"
              (change)="limpiar()"
            />
            Puesto
          </label>
        </div>
      </div>

      @if (modo === 'socio') {
        <div class="fg-field">
          <label class="fg-label" for="socio">Socio</label>
          <select
            id="socio"
            class="fg-select"
            [(ngModel)]="socioId"
            (ngModelChange)="cargarDeuda()"
          >
            <option [ngValue]="null">Selecciona un socio</option>
            @for (socio of socios(); track socio.id) {
              <option [ngValue]="socio.id">
                {{ socio.codigo }} — {{ socio.nombre }} {{ socio.apellidos }}
              </option>
            }
          </select>
        </div>
      } @else {
        <div class="fg-field">
          <label class="fg-label" for="puesto">Puesto</label>
          <select
            id="puesto"
            class="fg-select"
            [(ngModel)]="puestoId"
            (ngModelChange)="cargarDeuda()"
          >
            <option [ngValue]="null">Selecciona un puesto</option>
            @for (puesto of puestos(); track puesto.id) {
              <option [ngValue]="puesto.id">{{ puesto.numero }}</option>
            }
          </select>
        </div>
      }
    </div>

    <div class="fg-card" style="margin-top:16px">
      <fg-table
        [columnas]="columnas"
        [filas]="pendientes()"
        [cargando]="cargando()"
        [buscador]="false"
        [seleccionable]="true"
        [tamanioPagina]="15"
        vacioTitulo="Sin cuentas pendientes"
        vacioTexto="Elige un socio o un puesto con deuda pendiente para poder cobrar."
        (seleccionCambio)="seleccionadas.set($event)"
      />

      @if (pendientes().length > 0) {
        <div class="pie">
          <div>
            <span class="fg-caption">{{ seleccionadas().length }} cuenta(s) seleccionada(s)</span>
            <strong>{{ total() | moneda }}</strong>
          </div>
          <span class="fg-spacer"></span>
          <button
            type="button"
            class="fg-btn fg-btn--primary"
            [disabled]="seleccionadas().length === 0"
            (click)="confirmando.set(true)"
          >
            Registrar pago
          </button>
        </div>
      }
    </div>

    @if (ultimoRecibo(); as recibo) {
      <div class="fg-card fg-card__body recibo">
        <div>
          <span class="fg-caption">Recibo emitido</span>
          <strong>N° {{ recibo.correlativo }} — {{ recibo.tipo }}</strong>
          <span class="fg-caption">{{ recibo.fecha | fechaHora }}</span>
        </div>
        <span class="fg-spacer"></span>
        <strong class="monto">{{ recibo.monto | moneda }}</strong>
      </div>
    }

    @if (confirmando()) {
      <fg-confirm
        titulo="Registrar pago"
        [mensaje]="
          'Se generara un recibo por ' +
          totalTexto() +
          ' y las ' +
          seleccionadas().length +
          ' cuenta(s) quedaran abonadas.'
        "
        nota="La operacion queda registrada en auditoria con tu usuario."
        textoConfirmar="Registrar pago"
        [procesando]="procesando()"
        (cancelar)="confirmando.set(false)"
        (confirmar)="pagar()"
      />
    }
  `,
  styles: [
    `
      .selector {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        gap: var(--fg-space-4);
        align-items: end;
      }
      .pie {
        display: flex;
        align-items: center;
        gap: var(--fg-space-4);
        padding: var(--fg-space-4) var(--fg-space-6);
        border-top: 1px solid var(--fg-border-soft);
        flex-wrap: wrap;
      }
      .pie div {
        display: flex;
        flex-direction: column;
      }
      .pie strong {
        font: 700 20px/28px var(--fg-font-family);
      }
      .recibo {
        display: flex;
        align-items: center;
        gap: var(--fg-space-4);
        margin-top: var(--fg-space-4);
        border-left: 4px solid var(--fg-success);
      }
      .recibo div {
        display: flex;
        flex-direction: column;
      }
      .recibo .monto {
        font: 700 22px/30px var(--fg-font-family);
        color: var(--fg-success);
      }
      @media (max-width: 767px) {
        .selector {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class CobranzaPage {
  private readonly cuentaApi = inject(CuentaCobrarApi);
  private readonly reciboApi = inject(ReciboApi);
  private readonly socioApi = inject(SocioApi);
  private readonly puestoApi = inject(PuestoApi);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly moneda = new MonedaPipe();

  protected modo: 'socio' | 'puesto' = 'socio';
  protected socioId: number | null = null;
  protected puestoId: number | null = null;

  protected readonly socios = signal<Socio[]>([]);
  protected readonly puestos = signal<Puesto[]>([]);
  protected readonly pendientes = signal<CuentaCobrar[]>([]);
  protected readonly seleccionadas = signal<CuentaCobrar[]>([]);
  protected readonly cargando = signal(false);
  protected readonly procesando = signal(false);
  protected readonly confirmando = signal(false);
  protected readonly ultimoRecibo = signal<Recibo | null>(null);

  protected readonly columnas: Columna<CuentaCobrar>[] = [
    { header: 'Servicio', value: (c) => c.servicio?.nombre },
    { header: 'Puesto', value: (c) => c.puesto?.numero },
    { header: 'Periodo', value: (c) => c.periodo, tipo: 'periodo' },
    { header: 'Monto', value: (c) => c.monto, tipo: 'moneda', align: 'right' },
    { header: 'Estado', value: (c) => c.estado, tipo: 'chip' }
  ];

  protected readonly total = computed(() =>
    this.seleccionadas().reduce((suma, c) => suma + (c.monto ?? 0), 0)
  );

  constructor() {
    forkJoin({ socios: this.socioApi.listar(), puestos: this.puestoApi.listar() }).subscribe({
      next: ({ socios, puestos }) => {
        this.socios.set(socios);
        this.puestos.set(puestos);
      }
    });
  }

  protected totalTexto(): string {
    return this.moneda.transform(this.total());
  }

  protected limpiar(): void {
    this.socioId = null;
    this.puestoId = null;
    this.pendientes.set([]);
    this.seleccionadas.set([]);
  }

  protected cargarDeuda(): void {
    const id = this.modo === 'socio' ? this.socioId : this.puestoId;
    if (!id) {
      this.pendientes.set([]);
      return;
    }
    this.cargando.set(true);
    this.seleccionadas.set([]);
    const peticion =
      this.modo === 'socio'
        ? this.cuentaApi.listarPorSocio(id)
        : this.cuentaApi.listarPorPuesto(id);

    peticion.subscribe({
      next: (cuentas) => {
        this.pendientes.set(cuentas.filter((c) => c.estado === 'PENDIENTE'));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  protected pagar(): void {
    const cuentaIds = this.seleccionadas()
      .map((c) => c.id)
      .filter((id): id is number => typeof id === 'number');
    if (cuentaIds.length === 0) {
      return;
    }
    this.procesando.set(true);
    this.reciboApi.procesarPago({ cuentaIds, usuarioId: this.auth.usuarioId() }).subscribe({
      next: (recibo) => {
        this.procesando.set(false);
        this.confirmando.set(false);
        this.ultimoRecibo.set(recibo);
        this.toast.success(
          'Pago registrado',
          `Se emitio el recibo N° ${recibo.correlativo} por ${this.moneda.transform(recibo.monto)}.`
        );
        this.seleccionadas.set([]);
        this.cargarDeuda();
      },
      error: () => {
        this.procesando.set(false);
        this.confirmando.set(false);
      }
    });
  }
}
