import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ComprobanteEgresoApi, EgresoApi } from '../../core/api/egresos.api';
import { AuthService } from '../../core/auth/auth.service';
import { ComprobanteEgreso, Egreso } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor, hoyIso } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

/** RF-28, RF-30: comprobantes de los egresos, con anulacion y procesamiento auditados. */
@Component({
  selector: 'fg-comprobantes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FgPageHeader, FgTable, FgModal, FgField, FgConfirm],
  template: `
    <fg-page-header
      titulo="Comprobantes de egreso"
      descripcion="Documentos que respaldan cada salida de dinero."
    >
      <button type="button" class="fg-btn fg-btn--primary" (click)="abrirNuevo()">
        Nuevo comprobante
      </button>
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="comprobantes()"
        [cargando]="cargando()"
        [tieneFiltros]="true"
        placeholder="Buscar por numero..."
        vacioTitulo="Todavia no hay comprobantes"
        vacioTexto="Registra el comprobante de un egreso para verlo aqui."
      >
        <label tablaFiltros class="fg-check">
          <input type="checkbox" [checked]="filtrarPorMes()" (change)="alternarFiltroMes()" />
          Filtrar por rango
        </label>
        @if (filtrarPorMes()) {
          <ng-container tablaFiltros>
            <input
              class="fg-input"
              style="max-width:160px"
              type="date"
              aria-label="Fecha inicio"
              [value]="fechaInicio()"
              (change)="fechaInicio.set($any($event.target).value); cargar()"
            />
            <input
              class="fg-input"
              style="max-width:160px"
              type="date"
              aria-label="Fecha fin"
              [value]="fechaFin()"
              (change)="fechaFin.set($any($event.target).value); cargar()"
            />
          </ng-container>
        }

        <ng-template #acciones let-comprobante>
          <button
            type="button"
            class="fg-btn fg-btn--secondary fg-btn--sm"
            (click)="accion.set({ comprobante: comprobante, tipo: 'procesar' })"
          >
            Procesar
          </button>
          <button
            type="button"
            class="fg-btn fg-btn--ghost fg-btn--sm"
            (click)="accion.set({ comprobante: comprobante, tipo: 'anular' })"
          >
            Anular
          </button>
        </ng-template>
      </fg-table>
    </div>

    @if (mostrarForm()) {
      <fg-modal titulo="Nuevo comprobante" (cerrar)="mostrarForm.set(false)">
        <form [formGroup]="form" class="fg-form-grid" novalidate>
          <fg-field label="Numero" [control]="form.controls.numero" [requerido]="true">
            <input class="fg-input" formControlName="numero" />
          </fg-field>
          <fg-field label="Fecha de emision" [control]="form.controls.fechaEmision" [requerido]="true">
            <input class="fg-input" type="date" formControlName="fechaEmision" />
          </fg-field>
          <fg-field label="Monto" [control]="form.controls.monto" [requerido]="true">
            <input class="fg-input" type="number" step="0.01" min="0.01" formControlName="monto" />
          </fg-field>
          <fg-field label="Egreso" [control]="form.controls.egresoId" [requerido]="true">
            <select class="fg-select" formControlName="egresoId">
              <option [ngValue]="null">Selecciona un egreso</option>
              @for (egreso of egresos(); track egreso.id) {
                <option [ngValue]="egreso.id">
                  #{{ egreso.id }} — {{ egreso.proveedor }} — {{ egreso.total }}
                </option>
              }
            </select>
          </fg-field>
        </form>
        <div modalFooter>
          <button type="button" class="fg-btn fg-btn--ghost" (click)="mostrarForm.set(false)">
            Cancelar
          </button>
          <button
            type="button"
            class="fg-btn fg-btn--primary"
            [disabled]="guardando()"
            (click)="guardar()"
          >
            @if (guardando()) {
              <span class="fg-spinner"></span>
            }
            Guardar
          </button>
        </div>
      </fg-modal>
    }

    @if (accion(); as pendiente) {
      <fg-confirm
        [titulo]="pendiente.tipo === 'anular' ? 'Anular comprobante' : 'Procesar comprobante'"
        [mensaje]="
          'El comprobante ' +
          pendiente.comprobante.numero +
          (pendiente.tipo === 'anular'
            ? ' quedara marcado como anulado.'
            : ' quedara marcado como procesado.')
        "
        nota="La accion queda registrada en auditoria con tu usuario."
        [textoConfirmar]="pendiente.tipo === 'anular' ? 'Anular' : 'Procesar'"
        [peligroso]="pendiente.tipo === 'anular'"
        (cancelar)="accion.set(null)"
        (confirmar)="ejecutar(pendiente)"
      />
    }
  `
})
export class ComprobantesPage {
  private readonly api = inject(ComprobanteEgresoApi);
  private readonly egresoApi = inject(EgresoApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly comprobantes = signal<ComprobanteEgreso[]>([]);
  protected readonly egresos = signal<Egreso[]>([]);
  protected readonly cargando = signal(true);
  protected readonly mostrarForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly filtrarPorMes = signal(false);
  protected readonly fechaInicio = signal(hoyIso());
  protected readonly fechaFin = signal(hoyIso());
  protected readonly accion = signal<{
    comprobante: ComprobanteEgreso;
    tipo: 'anular' | 'procesar';
  } | null>(null);

  protected readonly columnas: Columna<ComprobanteEgreso>[] = [
    { header: 'Numero', value: (c) => c.numero },
    { header: 'Emision', value: (c) => c.fechaEmision, tipo: 'fecha' },
    { header: 'Monto', value: (c) => c.monto, tipo: 'moneda', align: 'right' },
    { header: 'Egreso', value: (c) => c.egresoId },
    { header: 'Estado', value: (c) => c.estado, tipo: 'chip' }
  ];

  protected readonly form = this.fb.group({
    numero: ['', [Validators.required]],
    fechaEmision: [hoyIso(), [Validators.required]],
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
    egresoId: [null as number | null, [Validators.required]]
  });

  constructor() {
    this.cargar();
    this.egresoApi.listar().subscribe({ next: (egresos) => this.egresos.set(egresos) });
  }

  protected alternarFiltroMes(): void {
    this.filtrarPorMes.update((valor) => !valor);
    this.cargar();
  }

  protected abrirNuevo(): void {
    this.form.reset({ fechaEmision: hoyIso(), egresoId: null });
    this.mostrarForm.set(true);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    this.guardando.set(true);
    this.api
      .registrar({
        numero: valores.numero ?? '',
        fechaEmision: valores.fechaEmision ?? hoyIso(),
        monto: valores.monto ?? 0,
        egresoId: valores.egresoId,
        usuarioId: this.auth.usuarioId()
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrarForm.set(false);
          this.toast.success('Comprobante registrado');
          this.cargar();
        },
        error: (error) => {
          this.guardando.set(false);
          aplicarErroresServidor(this.form, error);
        }
      });
  }

  protected ejecutar(pendiente: {
    comprobante: ComprobanteEgreso;
    tipo: 'anular' | 'procesar';
  }): void {
    const id = pendiente.comprobante.id;
    if (!id) return;
    const peticion =
      pendiente.tipo === 'anular'
        ? this.api.anular(id, this.auth.usuarioId())
        : this.api.procesar(id, this.auth.usuarioId());

    peticion.subscribe({
      next: () => {
        this.accion.set(null);
        this.toast.success(
          pendiente.tipo === 'anular' ? 'Comprobante anulado' : 'Comprobante procesado',
          'La accion quedo registrada en auditoria.'
        );
        this.cargar();
      },
      error: () => this.accion.set(null)
    });
  }

  protected cargar(): void {
    this.cargando.set(true);
    const peticion = this.filtrarPorMes()
      ? this.api.listarPorMes(this.fechaInicio(), this.fechaFin())
      : this.api.listar();

    peticion.subscribe({
      next: (comprobantes) => {
        this.comprobantes.set(comprobantes);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
