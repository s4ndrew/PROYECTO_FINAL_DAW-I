import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { GiroApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { Giro } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

/** RF-11, RF-12: catalogo de giros comerciales. Escritura solo ADMIN. */
@Component({
  selector: 'fg-giros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FgPageHeader, FgTable, FgModal, FgField, FgConfirm],
  template: `
    <fg-page-header titulo="Giros" descripcion="Rubros comerciales que puede tener un puesto.">
      @if (auth.esAdmin()) {
        <button type="button" class="fg-btn fg-btn--primary" (click)="abrirNuevo()">
          Nuevo giro
        </button>
      }
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="giros()"
        [cargando]="cargando()"
        placeholder="Buscar giro..."
        vacioTitulo="Todavia no hay giros"
        vacioTexto="Registra los rubros de la galeria para poder clasificar los puestos."
      >
        <ng-template #acciones let-giro>
          @if (auth.esAdmin()) {
            <button type="button" class="fg-btn fg-btn--ghost fg-btn--sm" (click)="editar(giro)">
              Editar
            </button>
            <button
              type="button"
              class="fg-btn fg-btn--ghost fg-btn--sm"
              (click)="porEliminar.set(giro)"
            >
              Eliminar
            </button>
          }
        </ng-template>
      </fg-table>
    </div>

    @if (mostrarForm()) {
      <fg-modal [titulo]="editando() ? 'Editar giro' : 'Nuevo giro'" (cerrar)="cerrarForm()">
        <form [formGroup]="form" class="fg-form-grid fg-form-grid--1" novalidate>
          <fg-field label="Nombre" [control]="form.controls.nombre" [requerido]="true">
            <input class="fg-input" formControlName="nombre" maxlength="100" />
          </fg-field>
          <fg-field label="Descripcion" [control]="form.controls.descripcion">
            <textarea class="fg-textarea" formControlName="descripcion" maxlength="255"></textarea>
          </fg-field>
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

    @if (porEliminar(); as giro) {
      <fg-confirm
        titulo="Eliminar giro"
        [mensaje]="'Se eliminara el giro ' + giro.nombre + '.'"
        nota="Si hay puestos usando este giro, el backend rechazara la operacion."
        textoConfirmar="Eliminar"
        [peligroso]="true"
        (cancelar)="porEliminar.set(null)"
        (confirmar)="eliminar(giro)"
      />
    }
  `
})
export class GirosPage {
  private readonly api = inject(GiroApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly giros = signal<Giro[]>([]);
  protected readonly cargando = signal(true);
  protected readonly mostrarForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly editando = signal<Giro | null>(null);
  protected readonly porEliminar = signal<Giro | null>(null);

  protected readonly columnas: Columna<Giro>[] = [
    { header: 'Nombre', value: (g) => g.nombre },
    { header: 'Descripcion', value: (g) => g.descripcion }
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(255)]]
  });

  constructor() {
    this.cargar();
  }

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset();
    this.mostrarForm.set(true);
  }

  protected editar(giro: Giro): void {
    this.editando.set(giro);
    this.form.setValue({ nombre: giro.nombre, descripcion: giro.descripcion ?? '' });
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
    const giro = this.form.getRawValue() as Giro;
    const enEdicion = this.editando();
    this.guardando.set(true);

    const peticion = enEdicion?.id ? this.api.editar(enEdicion.id, giro) : this.api.crear(giro);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.toast.success(enEdicion ? 'Giro actualizado' : 'Giro registrado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        aplicarErroresServidor(this.form, error);
      }
    });
  }

  protected eliminar(giro: Giro): void {
    if (!giro.id) return;
    this.api.eliminar(giro.id).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.toast.success('Giro eliminado');
        this.cargar();
      },
      error: () => this.porEliminar.set(null)
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (giros) => {
        this.giros.set(giros);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
