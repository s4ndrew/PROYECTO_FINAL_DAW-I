import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { SocioApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { Socio } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

@Component({
  selector: 'fg-socios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FgPageHeader,
    FgTable,
    FgModal,
    FgField,
    FgConfirm
  ],
  template: `
    <fg-page-header titulo="Socios" descripcion="Propietarios registrados en la galeria.">
      @if (auth.esAdmin()) {
        <button type="button" class="fg-btn fg-btn--primary" (click)="abrirNuevo()">
          Nuevo socio
        </button>
      }
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="socios()"
        [cargando]="cargando()"
        [buscador]="false"
        [tieneFiltros]="true"
        vacioTitulo="Todavia no hay socios"
        vacioTexto="Registra al primer propietario para poder asignarle puestos y cuentas."
      >
        <input
          tablaFiltros
          class="fg-input fg-search"
          type="search"
          placeholder="Buscar por codigo, nombre o apellidos..."
          aria-label="Buscar socios"
          (input)="buscar($event)"
        />

        <ng-template #acciones let-socio>
          <a class="fg-btn fg-btn--secondary fg-btn--sm" [routerLink]="['/socios', socio.id]">
            Ver
          </a>
          @if (auth.esAdmin()) {
            <button type="button" class="fg-btn fg-btn--ghost fg-btn--sm" (click)="editar(socio)">
              Editar
            </button>
            <button
              type="button"
              class="fg-btn fg-btn--ghost fg-btn--sm"
              (click)="porEliminar.set(socio)"
            >
              Eliminar
            </button>
          }
        </ng-template>
      </fg-table>
    </div>

    @if (mostrarForm()) {
      <fg-modal [titulo]="editando() ? 'Editar socio' : 'Nuevo socio'" (cerrar)="cerrarForm()">
        <form [formGroup]="form" class="fg-form-grid" novalidate>
          <fg-field label="Codigo" [control]="form.controls.codigo" [requerido]="true">
            <input class="fg-input" formControlName="codigo" maxlength="20" />
          </fg-field>
          <fg-field label="Accion" [control]="form.controls.accion" [requerido]="true">
            <input class="fg-input" formControlName="accion" maxlength="50" />
          </fg-field>
          <fg-field label="Nombre" [control]="form.controls.nombre" [requerido]="true">
            <input class="fg-input" formControlName="nombre" maxlength="100" />
          </fg-field>
          <fg-field label="Apellidos" [control]="form.controls.apellidos" [requerido]="true">
            <input class="fg-input" formControlName="apellidos" maxlength="100" />
          </fg-field>
          <fg-field
            label="Etapa"
            [control]="form.controls.etapa"
            [requerido]="true"
            ayuda="Etapas validas: 1, 2 o 3."
          >
            <select class="fg-select" formControlName="etapa">
              <option value="">Selecciona</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </fg-field>
          <fg-field
            label="Fecha de nacimiento"
            [control]="form.controls.fechaNacimiento"
            [requerido]="true"
          >
            <input class="fg-input" type="date" formControlName="fechaNacimiento" />
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

    @if (porEliminar(); as socio) {
      <fg-confirm
        titulo="Eliminar socio"
        [mensaje]="'Se eliminara a ' + socio.nombre + ' ' + socio.apellidos + '.'"
        nota="Si el socio tiene puestos o cuentas asociadas, no se podra eliminar."
        textoConfirmar="Eliminar"
        [peligroso]="true"
        (cancelar)="porEliminar.set(null)"
        (confirmar)="eliminar(socio)"
      />
    }
  `
})
export class SociosPage {
  private readonly api = inject(SocioApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly socios = signal<Socio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly mostrarForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly editando = signal<Socio | null>(null);
  protected readonly porEliminar = signal<Socio | null>(null);

  private readonly textoBusqueda = new Subject<string>();

  protected readonly columnas: Columna<Socio>[] = [
    { header: 'Codigo', value: (s) => s.codigo },
    { header: 'Nombre', value: (s) => s.nombre },
    { header: 'Apellidos', value: (s) => s.apellidos },
    { header: 'Accion', value: (s) => s.accion },
    { header: 'Etapa', value: (s) => s.etapa },
    { header: 'Nacimiento', value: (s) => s.fechaNacimiento, tipo: 'fecha' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    accion: ['', [Validators.required, Validators.maxLength(50)]],
    etapa: ['', [Validators.required, Validators.pattern(/^[123]$/)]],
    fechaNacimiento: ['', [Validators.required]]
  });

  constructor() {
    this.cargar();
    this.textoBusqueda
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((texto) => (texto ? this.api.buscar(texto) : this.api.listar()))
      )
      .subscribe({
        next: (socios) => {
          this.socios.set(socios);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false)
      });
  }

  protected buscar(evento: Event): void {
    this.cargando.set(true);
    this.textoBusqueda.next((evento.target as HTMLInputElement).value.trim());
  }

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset();
    this.mostrarForm.set(true);
  }

  protected editar(socio: Socio): void {
    this.editando.set(socio);
    this.form.setValue({
      codigo: socio.codigo,
      nombre: socio.nombre,
      apellidos: socio.apellidos,
      accion: socio.accion,
      etapa: socio.etapa,
      fechaNacimiento: socio.fechaNacimiento
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
    const socio = this.form.getRawValue() as Socio;
    const enEdicion = this.editando();
    this.guardando.set(true);

    const peticion = enEdicion?.id
      ? this.api.editar(enEdicion.id, socio)
      : this.api.crear(socio);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.toast.success(enEdicion ? 'Socio actualizado' : 'Socio registrado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        aplicarErroresServidor(this.form, error);
      }
    });
  }

  protected eliminar(socio: Socio): void {
    if (!socio.id) return;
    this.api.eliminar(socio.id).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.toast.success('Socio eliminado');
        this.cargar();
      },
      error: () => this.porEliminar.set(null)
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (socios) => {
        this.socios.set(socios);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
