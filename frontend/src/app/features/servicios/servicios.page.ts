import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ServicioApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { Servicio } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

/**
 * RF-13 a RF-15. tipoCosto FIJO usa `costo`; CONSUMO usa `costoUnitario`
 * (el backend igual exige `costo` mayor a 0 en ambos casos).
 */
@Component({
  selector: 'fg-servicios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FgPageHeader, FgTable, FgModal, FgField, FgConfirm],
  template: `
    <fg-page-header
      titulo="Servicios"
      descripcion="Conceptos que se cobran a socios y puestos: mantenimiento, luz, cuotas."
    >
      @if (auth.esAdmin()) {
        <button type="button" class="fg-btn fg-btn--primary" (click)="abrirNuevo()">
          Nuevo servicio
        </button>
      }
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="servicios()"
        [cargando]="cargando()"
        [tieneFiltros]="true"
        placeholder="Buscar servicio..."
        vacioTitulo="Todavia no hay servicios"
        vacioTexto="Define al menos un servicio para poder generar cuentas por cobrar."
      >
        <label tablaFiltros class="fg-check">
          <input type="checkbox" [checked]="soloActivos()" (change)="alternarSoloActivos()" />
          Solo activos
        </label>

        <ng-template #acciones let-servicio>
          @if (auth.esAdmin()) {
            <button
              type="button"
              class="fg-btn fg-btn--ghost fg-btn--sm"
              (click)="editar(servicio)"
            >
              Editar
            </button>
            <button
              type="button"
              class="fg-btn fg-btn--ghost fg-btn--sm"
              (click)="cambiarEstado(servicio)"
            >
              {{ servicio.estado ? 'Desactivar' : 'Activar' }}
            </button>
            <button
              type="button"
              class="fg-btn fg-btn--ghost fg-btn--sm"
              (click)="porEliminar.set(servicio)"
            >
              Eliminar
            </button>
          }
        </ng-template>
      </fg-table>
    </div>

    @if (mostrarForm()) {
      <fg-modal
        [titulo]="editando() ? 'Editar servicio' : 'Nuevo servicio'"
        (cerrar)="cerrarForm()"
      >
        <form [formGroup]="form" class="fg-form-grid" novalidate>
          <fg-field label="Nombre" [control]="form.controls.nombre" [requerido]="true">
            <input class="fg-input" formControlName="nombre" maxlength="100" />
          </fg-field>
          <fg-field label="Recurrencia" [control]="form.controls.recurrencia" [requerido]="true">
            <select class="fg-select" formControlName="recurrencia">
              <option value="MENSUAL">MENSUAL</option>
              <option value="ANUAL">ANUAL</option>
              <option value="UNICA">UNICA</option>
            </select>
          </fg-field>
          <fg-field label="Destino del cargo" [control]="form.controls.destinoCargo" [requerido]="true">
            <select class="fg-select" formControlName="destinoCargo">
              <option value="PUESTO">PUESTO</option>
              <option value="SOCIO">SOCIO</option>
            </select>
          </fg-field>
          <fg-field label="Tipo de costo" [control]="form.controls.tipoCosto" [requerido]="true">
            <select class="fg-select" formControlName="tipoCosto">
              <option value="FIJO">FIJO</option>
              <option value="CONSUMO">CONSUMO</option>
            </select>
          </fg-field>
          <fg-field
            label="Costo"
            [control]="form.controls.costo"
            [requerido]="true"
            ayuda="Debe ser mayor a 0."
          >
            <input class="fg-input" type="number" step="0.01" min="0.01" formControlName="costo" />
          </fg-field>
          <fg-field
            label="Costo unitario"
            [control]="form.controls.costoUnitario"
            ayuda="Solo para servicios por consumo (precio por unidad de lectura)."
          >
            <input
              class="fg-input"
              type="number"
              step="0.0001"
              min="0"
              formControlName="costoUnitario"
            />
          </fg-field>
          <fg-field label="Moneda" [control]="form.controls.moneda" [requerido]="true">
            <select class="fg-select" formControlName="moneda">
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
            </select>
          </fg-field>
          <div class="fg-field">
            <span class="fg-label">Estado</span>
            <label class="fg-check">
              <input type="checkbox" formControlName="estado" />
              Servicio activo
            </label>
          </div>
        </form>
        <div modalFooter>
          <button type="button" class="fg-btn fg-btn--ghost" (click)="cerrarForm()">Cancelar</button>
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

    @if (porEliminar(); as servicio) {
      <fg-confirm
        titulo="Eliminar servicio"
        [mensaje]="'Se eliminara ' + servicio.nombre + '.'"
        nota="Si ya genero cuentas por cobrar, el backend rechazara la operacion."
        textoConfirmar="Eliminar"
        [peligroso]="true"
        (cancelar)="porEliminar.set(null)"
        (confirmar)="eliminar(servicio)"
      />
    }
  `
})
export class ServiciosPage {
  private readonly api = inject(ServicioApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly soloActivos = signal(false);
  protected readonly mostrarForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly editando = signal<Servicio | null>(null);
  protected readonly porEliminar = signal<Servicio | null>(null);

  protected readonly columnas: Columna<Servicio>[] = [
    { header: 'Nombre', value: (s) => s.nombre },
    { header: 'Recurrencia', value: (s) => s.recurrencia },
    { header: 'Destino', value: (s) => s.destinoCargo },
    { header: 'Tipo', value: (s) => s.tipoCosto },
    { header: 'Costo', value: (s) => s.costo, tipo: 'moneda', align: 'right' },
    { header: 'Costo unitario', value: (s) => s.costoUnitario, align: 'right' },
    { header: 'Estado', value: (s) => s.estado, tipo: 'chip' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    recurrencia: ['MENSUAL', [Validators.required, Validators.maxLength(50)]],
    moneda: ['PEN', [Validators.required, Validators.maxLength(10)]],
    costo: [null as number | null, [Validators.required, Validators.min(0.01)]],
    destinoCargo: ['PUESTO', [Validators.required]],
    tipoCosto: ['FIJO', [Validators.required]],
    costoUnitario: [null as number | null, [Validators.min(0.0001)]],
    estado: [true]
  });

  constructor() {
    this.cargar();
  }

  protected alternarSoloActivos(): void {
    this.soloActivos.update((valor) => !valor);
    this.cargar();
  }

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset({
      recurrencia: 'MENSUAL',
      moneda: 'PEN',
      destinoCargo: 'PUESTO',
      tipoCosto: 'FIJO',
      estado: true,
      costo: null,
      costoUnitario: null
    });
    this.mostrarForm.set(true);
  }

  protected editar(servicio: Servicio): void {
    this.editando.set(servicio);
    this.form.setValue({
      nombre: servicio.nombre,
      recurrencia: servicio.recurrencia,
      moneda: servicio.moneda,
      costo: servicio.costo ?? null,
      destinoCargo: servicio.destinoCargo ?? 'PUESTO',
      tipoCosto: servicio.tipoCosto ?? 'FIJO',
      costoUnitario: servicio.costoUnitario ?? null,
      estado: servicio.estado
    });
    this.mostrarForm.set(true);
  }

  protected cerrarForm(): void {
    this.mostrarForm.set(false);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const servicio = this.form.getRawValue() as unknown as Servicio;
    const enEdicion = this.editando();
    this.guardando.set(true);

    const peticion = enEdicion?.id
      ? this.api.editar(enEdicion.id, servicio)
      : this.api.crear(servicio);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.toast.success(enEdicion ? 'Servicio actualizado' : 'Servicio registrado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        aplicarErroresServidor(this.form, error);
      }
    });
  }

  protected cambiarEstado(servicio: Servicio): void {
    if (!servicio.id) return;
    this.api.cambiarEstado(servicio.id, !servicio.estado).subscribe({
      next: () => {
        this.toast.success(servicio.estado ? 'Servicio desactivado' : 'Servicio activado');
        this.cargar();
      }
    });
  }

  protected eliminar(servicio: Servicio): void {
    if (!servicio.id) return;
    this.api.eliminar(servicio.id).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.toast.success('Servicio eliminado');
        this.cargar();
      },
      error: () => this.porEliminar.set(null)
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    const peticion = this.soloActivos() ? this.api.listarActivos() : this.api.listar();
    peticion.subscribe({
      next: (servicios) => {
        this.servicios.set(servicios);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
