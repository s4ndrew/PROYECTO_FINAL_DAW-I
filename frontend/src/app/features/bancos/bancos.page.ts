import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BancoApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { Banco } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

@Component({
  selector: 'fg-bancos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FgPageHeader, FgTable, FgModal, FgField, FgConfirm],
  template: `
    <fg-page-header titulo="Bancos" descripcion="Cuentas bancarias para los canjes y depositos.">
      @if (auth.esAdmin()) {
        <button type="button" class="fg-btn fg-btn--primary" (click)="abrirNuevo()">
          Nuevo banco
        </button>
      }
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="bancos()"
        [cargando]="cargando()"
        placeholder="Buscar banco..."
        vacioTitulo="Todavia no hay bancos"
        vacioTexto="Registra una cuenta bancaria para poder canjear cuentas de socios."
      >
        <ng-template #acciones let-banco>
          @if (auth.esAdmin()) {
            <button type="button" class="fg-btn fg-btn--ghost fg-btn--sm" (click)="editar(banco)">
              Editar
            </button>
            <button
              type="button"
              class="fg-btn fg-btn--ghost fg-btn--sm"
              (click)="porEliminar.set(banco)"
            >
              Eliminar
            </button>
          }
        </ng-template>
      </fg-table>
    </div>

    @if (mostrarForm()) {
      <fg-modal [titulo]="editando() ? 'Editar banco' : 'Nuevo banco'" (cerrar)="cerrarForm()">
        <form [formGroup]="form" class="fg-form-grid" novalidate>
          <fg-field label="Nombre" [control]="form.controls.nombre" [requerido]="true">
            <input class="fg-input" formControlName="nombre" maxlength="100" />
          </fg-field>
          <fg-field
            label="Moneda"
            [control]="form.controls.moneda"
            [requerido]="true"
            ayuda="Solo se acepta PEN."
          >
            <select class="fg-select" formControlName="moneda">
              <option value="PEN">PEN</option>
            </select>
          </fg-field>
          <fg-field
            label="Numero de cuenta"
            [control]="form.controls.numeroCuenta"
            [requerido]="true"
            ayuda="Entre 6 y 20 digitos, sin guiones."
          >
            <input class="fg-input" formControlName="numeroCuenta" inputmode="numeric" />
          </fg-field>
          <fg-field
            label="CCI"
            [control]="form.controls.cci"
            [requerido]="true"
            ayuda="Exactamente 20 digitos."
          >
            <input class="fg-input" formControlName="cci" inputmode="numeric" maxlength="20" />
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

    @if (porEliminar(); as banco) {
      <fg-confirm
        titulo="Eliminar banco"
        [mensaje]="'Se eliminara ' + banco.nombre + '.'"
        nota="Si tiene recibos de canje asociados, no se podra eliminar."
        textoConfirmar="Eliminar"
        [peligroso]="true"
        (cancelar)="porEliminar.set(null)"
        (confirmar)="eliminar(banco)"
      />
    }
  `
})
export class BancosPage {
  private readonly api = inject(BancoApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly bancos = signal<Banco[]>([]);
  protected readonly cargando = signal(true);
  protected readonly mostrarForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly editando = signal<Banco | null>(null);
  protected readonly porEliminar = signal<Banco | null>(null);

  protected readonly columnas: Columna<Banco>[] = [
    { header: 'Nombre', value: (b) => b.nombre },
    { header: 'Numero de cuenta', value: (b) => b.numeroCuenta },
    { header: 'CCI', value: (b) => b.cci },
    { header: 'Moneda', value: (b) => b.moneda }
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    numeroCuenta: ['', [Validators.required, Validators.pattern(/^[0-9]{6,20}$/)]],
    cci: ['', [Validators.required, Validators.pattern(/^[0-9]{20}$/)]],
    moneda: ['PEN', [Validators.required, Validators.pattern(/^PEN$/)]]
  });

  constructor() {
    this.cargar();
  }

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset({ moneda: 'PEN' });
    this.mostrarForm.set(true);
  }

  protected editar(banco: Banco): void {
    this.editando.set(banco);
    this.form.setValue({
      nombre: banco.nombre,
      numeroCuenta: banco.numeroCuenta ?? '',
      cci: banco.cci ?? '',
      moneda: banco.moneda ?? 'PEN'
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
    const banco = this.form.getRawValue() as Banco;
    const enEdicion = this.editando();
    this.guardando.set(true);

    const peticion = enEdicion?.id ? this.api.editar(enEdicion.id, banco) : this.api.crear(banco);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.toast.success(enEdicion ? 'Banco actualizado' : 'Banco registrado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        aplicarErroresServidor(this.form, error);
      }
    });
  }

  protected eliminar(banco: Banco): void {
    if (!banco.id) return;
    this.api.eliminar(banco.id).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.toast.success('Banco eliminado');
        this.cargar();
      },
      error: () => this.porEliminar.set(null)
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (bancos) => {
        this.bancos.set(bancos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
