import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { CuentaCobrarApi } from '../../core/api/caja.api';
import { PuestoApi, ServicioApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { CuentaCobrar, EstadoCuenta, Puesto, Servicio } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor, periodoActual } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { MonedaPipe } from '../../shared/ui/pipes';
import { Columna, FgTable } from '../../shared/ui/table';

type Generador = 'puestos' | 'consumo' | 'socios' | null;

@Component({
  selector: 'fg-cuentas-cobrar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FgPageHeader,
    FgTable,
    FgModal,
    FgField,
    FgConfirm,
    MonedaPipe
  ],
  template: `
    <fg-page-header
      titulo="Cuentas por cobrar"
      descripcion="Cargos generados a puestos y socios por cada periodo."
    >
      <button type="button" class="fg-btn fg-btn--secondary" (click)="abrir('puestos')">
        Generar por puestos
      </button>
      <button type="button" class="fg-btn fg-btn--secondary" (click)="abrir('consumo')">
        Generar por consumo
      </button>
      <button type="button" class="fg-btn fg-btn--primary" (click)="abrir('socios')">
        Generar para socios
      </button>
    </fg-page-header>

    <section class="totales">
      <article class="fg-card fg-card__body">
        <span class="fg-caption">Cuentas listadas</span>
        <strong>{{ filtradas().length }}</strong>
      </article>
      <article class="fg-card fg-card__body">
        <span class="fg-caption">Total pendiente</span>
        <strong>{{ totalPendiente() | moneda }}</strong>
      </article>
      <article class="fg-card fg-card__body">
        <span class="fg-caption">Total abonado</span>
        <strong>{{ totalAbonado() | moneda }}</strong>
      </article>
    </section>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="filtradas()"
        [cargando]="cargando()"
        [tieneFiltros]="true"
        [tamanioPagina]="15"
        placeholder="Buscar por servicio, socio o puesto..."
        vacioTitulo="Todavia no hay cuentas por cobrar"
        vacioTexto="Genera los cargos del periodo con los botones de arriba."
      >
        <select
          tablaFiltros
          class="fg-select"
          style="max-width:180px"
          aria-label="Filtrar por estado"
          (change)="filtroEstado.set($any($event.target).value)"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="ABONADA">ABONADA</option>
          <option value="EXONERADA">EXONERADA</option>
        </select>
        <input
          tablaFiltros
          class="fg-input"
          style="max-width:170px"
          type="month"
          aria-label="Filtrar por periodo"
          (change)="filtroPeriodo.set($any($event.target).value)"
        />

        <ng-template #acciones let-cuenta>
          @if (cuenta.estado === 'PENDIENTE') {
            <button
              type="button"
              class="fg-btn fg-btn--secondary fg-btn--sm"
              (click)="abonar(cuenta)"
            >
              Abonar
            </button>
            <button
              type="button"
              class="fg-btn fg-btn--ghost fg-btn--sm"
              (click)="exonerar(cuenta)"
            >
              Exonerar
            </button>
          }
          <button
            type="button"
            class="fg-btn fg-btn--ghost fg-btn--sm"
            (click)="porAnular.set(cuenta)"
          >
            Anular
          </button>
        </ng-template>
      </fg-table>
    </div>

    <!-- Cargo fijo a un conjunto de puestos -->
    @if (generador() === 'puestos') {
      <fg-modal titulo="Generar cuentas por puestos" tamanio="lg" (cerrar)="cerrar()">
        <form [formGroup]="formPuestos" class="fg-form-grid" novalidate>
          <fg-field
            label="Servicio"
            [control]="formPuestos.controls.servicioId"
            [requerido]="true"
            ayuda="Solo servicios con tipo de costo FIJO."
          >
            <select class="fg-select" formControlName="servicioId">
              <option [ngValue]="null">Selecciona un servicio</option>
              @for (servicio of serviciosFijos(); track servicio.id) {
                <option [ngValue]="servicio.id">{{ servicio.nombre }}</option>
              }
            </select>
          </fg-field>
          <fg-field label="Periodo" [control]="formPuestos.controls.periodo" [requerido]="true">
            <input class="fg-input" type="month" formControlName="periodo" />
          </fg-field>
        </form>

        <div class="fg-field" style="margin-top:16px">
          <span class="fg-label">Puestos ({{ puestosElegidos().length }} seleccionados)</span>
          <div class="lista-puestos">
            @for (puesto of puestos(); track puesto.id) {
              <label class="fg-check">
                <input
                  type="checkbox"
                  [checked]="puestosElegidos().includes(puesto.id!)"
                  (change)="alternarPuesto(puesto)"
                />
                {{ puesto.numero }}
              </label>
            }
          </div>
          <span class="fg-help-text">
            Si una cuenta ya existe para ese puesto, servicio y periodo, se omite.
          </span>
        </div>

        <div modalFooter>
          <button type="button" class="fg-btn fg-btn--ghost" (click)="cerrar()">Cancelar</button>
          <button
            type="button"
            class="fg-btn fg-btn--primary"
            [disabled]="generando()"
            (click)="generarPuestos()"
          >
            @if (generando()) {
              <span class="fg-spinner"></span>
            }
            Generar
          </button>
        </div>
      </fg-modal>
    }

    <!-- El monto se calcula automaticamente con las lecturas -->
    @if (generador() === 'consumo') {
      <fg-modal titulo="Generar cuenta por consumo" (cerrar)="cerrar()">
        <form [formGroup]="formConsumo" class="fg-form-grid" novalidate>
          <fg-field
            label="Servicio"
            [control]="formConsumo.controls.servicioId"
            [requerido]="true"
            ayuda="Solo servicios con tipo de costo CONSUMO."
          >
            <select class="fg-select" formControlName="servicioId">
              <option [ngValue]="null">Selecciona un servicio</option>
              @for (servicio of serviciosConsumo(); track servicio.id) {
                <option [ngValue]="servicio.id">{{ servicio.nombre }}</option>
              }
            </select>
          </fg-field>
          <fg-field label="Puesto" [control]="formConsumo.controls.puestoId" [requerido]="true">
            <select class="fg-select" formControlName="puestoId">
              <option [ngValue]="null">Selecciona un puesto</option>
              @for (puesto of puestos(); track puesto.id) {
                <option [ngValue]="puesto.id">{{ puesto.numero }}</option>
              }
            </select>
          </fg-field>
          <fg-field label="Periodo" [control]="formConsumo.controls.periodo" [requerido]="true">
            <input class="fg-input" type="month" formControlName="periodo" />
          </fg-field>
          <fg-field
            label="Lectura inicial"
            [control]="formConsumo.controls.lecturaInicial"
            [requerido]="true"
          >
            <input class="fg-input" type="number" step="0.01" min="0" formControlName="lecturaInicial" />
          </fg-field>
          <fg-field
            label="Lectura final"
            [control]="formConsumo.controls.lecturaFinal"
            [requerido]="true"
            ayuda="monto = (final - inicial) x costo unitario del servicio."
          >
            <input class="fg-input" type="number" step="0.01" min="0" formControlName="lecturaFinal" />
          </fg-field>
        </form>
        <div modalFooter>
          <button type="button" class="fg-btn fg-btn--ghost" (click)="cerrar()">Cancelar</button>
          <button
            type="button"
            class="fg-btn fg-btn--primary"
            [disabled]="generando()"
            (click)="generarConsumo()"
          >
            @if (generando()) {
              <span class="fg-spinner"></span>
            }
            Generar
          </button>
        </div>
      </fg-modal>
    }

    <!-- Cuentas para socios -->
    @if (generador() === 'socios') {
      <fg-modal titulo="Generar cuentas para socios" (cerrar)="cerrar()">
        <form [formGroup]="formSocios" class="fg-form-grid" novalidate>
          <fg-field label="Servicio" [control]="formSocios.controls.servicioId" [requerido]="true">
            <select class="fg-select" formControlName="servicioId">
              <option [ngValue]="null">Selecciona un servicio</option>
              @for (servicio of servicios(); track servicio.id) {
                <option [ngValue]="servicio.id">{{ servicio.nombre }}</option>
              }
            </select>
          </fg-field>
          <fg-field label="Periodo" [control]="formSocios.controls.periodo" [requerido]="true">
            <input class="fg-input" type="month" formControlName="periodo" />
          </fg-field>
          <div class="fg-field fg-span-2">
            <span class="fg-label">Etapas</span>
            <div class="fg-row">
              @for (etapa of ['1', '2', '3']; track etapa) {
                <label class="fg-check">
                  <input
                    type="checkbox"
                    [checked]="etapasElegidas().includes(etapa)"
                    (change)="alternarEtapa(etapa)"
                  />
                  Etapa {{ etapa }}
                </label>
              }
            </div>
            <span class="fg-help-text">Sin seleccion, se toman todas las etapas.</span>
          </div>
          <div class="fg-field fg-span-2">
            <label class="fg-check">
              <input type="checkbox" formControlName="soloUnicos" />
              No duplicar por nombre y apellidos
            </label>
          </div>
        </form>
        <div modalFooter>
          <button type="button" class="fg-btn fg-btn--ghost" (click)="cerrar()">Cancelar</button>
          <button
            type="button"
            class="fg-btn fg-btn--primary"
            [disabled]="generando()"
            (click)="generarSocios()"
          >
            @if (generando()) {
              <span class="fg-spinner"></span>
            }
            Generar
          </button>
        </div>
      </fg-modal>
    }

    @if (porAnular(); as cuenta) {
      <fg-confirm
        titulo="Anular cuenta por cobrar"
        [mensaje]="'Se eliminara la cuenta #' + cuenta.id + ' del periodo ' + cuenta.periodo + '.'"
        nota="La anulacion queda registrada en auditoria con tu usuario."
        textoConfirmar="Anular"
        [peligroso]="true"
        (cancelar)="porAnular.set(null)"
        (confirmar)="anular(cuenta)"
      />
    }
  `,
  styles: [
    `
      .totales {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--fg-space-4);
        margin-bottom: var(--fg-space-4);
      }
      .totales article {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .totales strong {
        font: 700 22px/30px var(--fg-font-family);
      }
      .lista-puestos {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--fg-space-1);
        max-height: 220px;
        overflow-y: auto;
        border: 1px solid var(--fg-border-default);
        border-radius: var(--fg-radius-sm);
        padding: var(--fg-space-2);
      }
      @media (max-width: 767px) {
        .totales {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class CuentasCobrarPage {
  private readonly api = inject(CuentaCobrarApi);
  private readonly servicioApi = inject(ServicioApi);
  private readonly puestoApi = inject(PuestoApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly cuentas = signal<CuentaCobrar[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly puestos = signal<Puesto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly generador = signal<Generador>(null);
  protected readonly generando = signal(false);
  protected readonly porAnular = signal<CuentaCobrar | null>(null);

  protected readonly filtroEstado = signal<'' | EstadoCuenta>('');
  protected readonly filtroPeriodo = signal('');
  protected readonly puestosElegidos = signal<number[]>([]);
  protected readonly etapasElegidas = signal<string[]>([]);

  protected readonly columnas: Columna<CuentaCobrar>[] = [
    { header: 'Servicio', value: (c) => c.servicio?.nombre },
    {
      header: 'Socio',
      value: (c) => (c.socio ? `${c.socio.nombre} ${c.socio.apellidos}` : null)
    },
    { header: 'Puesto', value: (c) => c.puesto?.numero },
    { header: 'Periodo', value: (c) => c.periodo, tipo: 'periodo' },
    { header: 'Monto', value: (c) => c.monto, tipo: 'moneda', align: 'right' },
    { header: 'Estado', value: (c) => c.estado, tipo: 'chip' },
    { header: 'Generada', value: (c) => c.fechaGeneracion, tipo: 'fechaHora' }
  ];

  protected readonly filtradas = computed(() => {
    const estado = this.filtroEstado();
    const periodo = this.filtroPeriodo();
    return this.cuentas().filter(
      (c) => (!estado || c.estado === estado) && (!periodo || c.periodo === periodo)
    );
  });

  protected readonly totalPendiente = computed(() =>
    this.filtradas()
      .filter((c) => c.estado === 'PENDIENTE')
      .reduce((total, c) => total + (c.monto ?? 0), 0)
  );
  protected readonly totalAbonado = computed(() =>
    this.filtradas()
      .filter((c) => c.estado === 'ABONADA')
      .reduce((total, c) => total + (c.monto ?? 0), 0)
  );

  protected readonly serviciosFijos = computed(() =>
    this.servicios().filter((s) => s.tipoCosto === 'FIJO')
  );
  protected readonly serviciosConsumo = computed(() =>
    this.servicios().filter((s) => s.tipoCosto === 'CONSUMO')
  );

  protected readonly formPuestos = this.fb.group({
    servicioId: [null as number | null, [Validators.required]],
    periodo: [periodoActual(), [Validators.required]]
  });

  protected readonly formConsumo = this.fb.group({
    servicioId: [null as number | null, [Validators.required]],
    puestoId: [null as number | null, [Validators.required]],
    periodo: [periodoActual(), [Validators.required]],
    lecturaInicial: [null as number | null, [Validators.required, Validators.min(0)]],
    lecturaFinal: [null as number | null, [Validators.required, Validators.min(0)]]
  });

  protected readonly formSocios = this.fb.group({
    servicioId: [null as number | null, [Validators.required]],
    periodo: [periodoActual(), [Validators.required]],
    soloUnicos: [true]
  });

  constructor() {
    this.cargar();
    forkJoin({
      servicios: this.servicioApi.listar(),
      puestos: this.puestoApi.listar()
    }).subscribe({
      next: ({ servicios, puestos }) => {
        this.servicios.set(servicios);
        this.puestos.set(puestos);
      }
    });
  }

  protected abrir(tipo: Exclude<Generador, null>): void {
    this.generador.set(tipo);
  }

  protected cerrar(): void {
    this.generador.set(null);
  }

  protected alternarPuesto(puesto: Puesto): void {
    if (!puesto.id) return;
    const id = puesto.id;
    this.puestosElegidos.update((actuales) =>
      actuales.includes(id) ? actuales.filter((p) => p !== id) : [...actuales, id]
    );
  }

  protected alternarEtapa(etapa: string): void {
    this.etapasElegidas.update((actuales) =>
      actuales.includes(etapa) ? actuales.filter((e) => e !== etapa) : [...actuales, etapa]
    );
  }

  protected generarPuestos(): void {
    if (this.formPuestos.invalid) {
      this.formPuestos.markAllAsTouched();
      return;
    }
    if (this.puestosElegidos().length === 0) {
      this.toast.warning('Selecciona al menos un puesto');
      return;
    }
    const valores = this.formPuestos.getRawValue();
    this.generando.set(true);
    this.api
      .generarParaPuestos({
        servicioId: valores.servicioId!,
        periodo: valores.periodo!,
        puestoIds: this.puestosElegidos()
      })
      .subscribe({
        next: (generadas) => {
          this.generando.set(false);
          this.cerrar();
          this.puestosElegidos.set([]);
          this.avisarGeneracion(generadas.length);
          this.cargar();
        },
        error: (error) => {
          this.generando.set(false);
          aplicarErroresServidor(this.formPuestos, error);
        }
      });
  }

  protected generarConsumo(): void {
    if (this.formConsumo.invalid) {
      this.formConsumo.markAllAsTouched();
      return;
    }
    const valores = this.formConsumo.getRawValue();
    this.generando.set(true);
    this.api
      .generarPorConsumo({
        servicioId: valores.servicioId!,
        puestoId: valores.puestoId!,
        periodo: valores.periodo!,
        lecturaInicial: valores.lecturaInicial!,
        lecturaFinal: valores.lecturaFinal!
      })
      .subscribe({
        next: (cuenta) => {
          this.generando.set(false);
          this.cerrar();
          this.toast.success(
            'Cuenta generada',
            `Monto calculado: ${cuenta.monto}`
          );
          this.cargar();
        },
        error: (error) => {
          this.generando.set(false);
          aplicarErroresServidor(this.formConsumo, error);
        }
      });
  }

  protected generarSocios(): void {
    if (this.formSocios.invalid) {
      this.formSocios.markAllAsTouched();
      return;
    }
    const valores = this.formSocios.getRawValue();
    this.generando.set(true);
    this.api
      .generarParaSocios({
        servicioId: valores.servicioId!,
        periodo: valores.periodo!,
        etapas: this.etapasElegidas(),
        soloUnicos: valores.soloUnicos ?? false
      })
      .subscribe({
        next: (generadas) => {
          this.generando.set(false);
          this.cerrar();
          this.avisarGeneracion(generadas.length);
          this.cargar();
        },
        error: (error) => {
          this.generando.set(false);
          aplicarErroresServidor(this.formSocios, error);
        }
      });
  }

  protected abonar(cuenta: CuentaCobrar): void {
    this.api.marcarAbonada(cuenta.id).subscribe({
      next: () => {
        this.toast.success('Cuenta marcada como abonada');
        this.cargar();
      }
    });
  }

  protected exonerar(cuenta: CuentaCobrar): void {
    this.api.marcarExonerada(cuenta.id).subscribe({
      next: () => {
        this.toast.success('Cuenta exonerada');
        this.cargar();
      }
    });
  }

  protected anular(cuenta: CuentaCobrar): void {
    this.api.anular(cuenta.id, this.auth.usuarioId()).subscribe({
      next: () => {
        this.porAnular.set(null);
        this.toast.success('Cuenta anulada', 'La accion quedo registrada en auditoria.');
        this.cargar();
      },
      error: () => this.porAnular.set(null)
    });
  }

  private avisarGeneracion(cantidad: number): void {
    if (cantidad === 0) {
      this.toast.info(
        'No se genero ninguna cuenta',
        'Ya existian cuentas para ese servicio y periodo.'
      );
    } else {
      this.toast.success(`${cantidad} cuenta(s) generada(s)`);
    }
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
