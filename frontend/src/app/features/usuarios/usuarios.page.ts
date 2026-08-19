import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UsuarioApi } from '../../core/api/sistema.api';
import { AuthService } from '../../core/auth/auth.service';
import { Usuario } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

/** RF-03: solo ADMIN. El password se cifra con BCrypt en el backend y nunca vuelve en las respuestas. */
@Component({
  selector: 'fg-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FgPageHeader, FgTable, FgModal, FgField, FgConfirm],
  template: `
    <fg-page-header titulo="Usuarios" descripcion="Cuentas de acceso al sistema.">
      <button type="button" class="fg-btn fg-btn--primary" (click)="abrirNuevo()">
        Nuevo usuario
      </button>
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="usuarios()"
        [cargando]="cargando()"
        placeholder="Buscar usuario..."
        vacioTitulo="Todavia no hay usuarios"
        vacioTexto="Crea la primera cuenta de acceso."
      >
        <ng-template #acciones let-usuario>
          <button type="button" class="fg-btn fg-btn--ghost fg-btn--sm" (click)="editar(usuario)">
            Editar
          </button>
          <button
            type="button"
            class="fg-btn fg-btn--ghost fg-btn--sm"
            [disabled]="usuario.id === auth.sesion()?.id"
            (click)="porEliminar.set(usuario)"
          >
            Eliminar
          </button>
        </ng-template>
      </fg-table>
    </div>

    @if (mostrarForm()) {
      <fg-modal [titulo]="editando() ? 'Editar usuario' : 'Nuevo usuario'" (cerrar)="cerrarForm()">
        <form [formGroup]="form" class="fg-form-grid" novalidate>
          <fg-field label="Usuario" [control]="form.controls.usuario" [requerido]="true">
            <input class="fg-input" formControlName="usuario" autocomplete="off" />
          </fg-field>
          <fg-field
            label="Contrasena"
            [control]="form.controls.password"
            [requerido]="!editando()"
            [ayuda]="
              editando()
                ? 'Dejalo vacio para conservar la contrasena actual.'
                : 'Minimo 6 caracteres.'
            "
          >
            <input
              class="fg-input"
              type="password"
              formControlName="password"
              autocomplete="new-password"
            />
          </fg-field>
          <fg-field label="Nombres" [control]="form.controls.nombres" [requerido]="true">
            <input class="fg-input" formControlName="nombres" maxlength="100" />
          </fg-field>
          <fg-field label="Apellidos" [control]="form.controls.apellidos" [requerido]="true">
            <input class="fg-input" formControlName="apellidos" maxlength="100" />
          </fg-field>
          <fg-field label="Rol" [control]="form.controls.rol" [requerido]="true">
            <select class="fg-select" formControlName="rol">
              <option value="ADMIN">ADMIN</option>
              <option value="OPERADOR">OPERADOR</option>
            </select>
          </fg-field>
          <div class="fg-field">
            <span class="fg-label">Estado</span>
            <label class="fg-check">
              <input type="checkbox" formControlName="activo" />
              Usuario activo
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

    @if (porEliminar(); as usuario) {
      <fg-confirm
        titulo="Eliminar usuario"
        [mensaje]="'Se eliminara la cuenta ' + usuario.usuario + '.'"
        nota="Si el usuario tiene recibos o egresos asociados, el backend rechazara la operacion."
        textoConfirmar="Eliminar"
        [peligroso]="true"
        (cancelar)="porEliminar.set(null)"
        (confirmar)="eliminar(usuario)"
      />
    }
  `
})
export class UsuariosPage {
  private readonly api = inject(UsuarioApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly mostrarForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly editando = signal<Usuario | null>(null);
  protected readonly porEliminar = signal<Usuario | null>(null);

  protected readonly columnas: Columna<Usuario>[] = [
    { header: 'Usuario', value: (u) => u.usuario },
    { header: 'Nombres', value: (u) => u.nombres },
    { header: 'Apellidos', value: (u) => u.apellidos },
    { header: 'Rol', value: (u) => u.rol },
    { header: 'Estado', value: (u) => u.activo, tipo: 'chip' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    rol: ['OPERADOR', [Validators.required]],
    activo: [true, [Validators.required]]
  });

  constructor() {
    this.cargar();
  }

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset({ rol: 'OPERADOR', activo: true });
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.mostrarForm.set(true);
  }

  protected editar(usuario: Usuario): void {
    this.editando.set(usuario);
    this.form.setValue({
      usuario: usuario.usuario,
      password: '',
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      rol: usuario.rol,
      activo: usuario.activo ?? true
    });
    // Al editar, el password es opcional: el backend conserva el hash existente.
    this.form.controls.password.setValidators([Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
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
    const valores = this.form.getRawValue();
    const enEdicion = this.editando();
    const usuario: Usuario = {
      usuario: valores.usuario,
      nombres: valores.nombres,
      apellidos: valores.apellidos,
      rol: valores.rol as Usuario['rol'],
      activo: valores.activo,
      password: valores.password ? valores.password : null
    };
    this.guardando.set(true);

    const peticion = enEdicion?.id
      ? this.api.editar(enEdicion.id, usuario)
      : this.api.crear(usuario);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.toast.success(enEdicion ? 'Usuario actualizado' : 'Usuario creado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        aplicarErroresServidor(this.form, error);
      }
    });
  }

  protected eliminar(usuario: Usuario): void {
    if (!usuario.id) return;
    this.api.eliminar(usuario.id).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.toast.success('Usuario eliminado');
        this.cargar();
      },
      error: () => this.porEliminar.set(null)
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
