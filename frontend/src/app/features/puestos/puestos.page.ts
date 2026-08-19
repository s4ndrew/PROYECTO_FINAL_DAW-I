import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, forkJoin, switchMap } from 'rxjs';

import { GiroApi, PuestoApi, SocioApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { Giro, Puesto, Socio } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

/** RF-08 a RF-10: el giro es obligatorio, el socio es opcional. */
@Component({
  selector: 'fg-puestos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FgPageHeader, FgTable, FgModal, FgField, FgConfirm],
  template: `
    <fg-page-header titulo="Puestos" descripcion="Modulos comerciales de la galeria.">
      @if (auth.esAdmin()) {
        <button type="button" class="fg-btn fg-btn--primary" (click)="abrirNuevo()">
          Nuevo puesto
        </button>
      }
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="puestos()"
        [cargando]="cargando()"
        [buscador]="false"
        [tieneFiltros]="true"
        vacioTitulo="Todavia no hay puestos"
        vacioTexto="Registra los modulos de la galeria para poder generar sus cuentas."
      >
        <input
          tablaFiltros
          class="fg-input fg-search"
          type="search"
          placeholder="Buscar por numero de puesto..."
          aria-label="Buscar puestos"
          (input)="buscar($event)"
        />

        <ng-template #acciones let-puesto>
          <a class="fg-btn fg-btn--secondary fg-btn--sm" [routerLink]="['/puestos', puesto.id]">
            Ver
          </a>
          @if (auth.esAdmin()) {
            <button type="button" class="fg-btn fg-btn--ghost fg-btn--sm" (click)="editar(puesto)">
              Editar
            </button>
            <button
              type="button"
              class="fg-btn fg-btn--ghost fg-btn--sm"
              (click)="porEliminar.set(puesto)"
            >
              Eliminar
            </button>
          }
        </ng-template>
      </fg-table>
    </div>

    @if (mostrarForm()) {
      <fg-modal [titulo]="editando() ? 'Editar puesto' : 'Nuevo puesto'" (cerrar)="cerrarForm()">
        <form [formGroup]="form" class="fg-form-grid" novalidate>
          <fg-field label="Numero" [control]="form.controls.numero" [requerido]="true">
            <input class="fg-input" formControlName="numero" maxlength="20" />
          </fg-field>
          <fg-field label="Giro" [control]="form.controls.giroId" [requerido]="true">
            <select class="fg-select" formControlName="giroId">
              <option [ngValue]="null">Selecciona un giro</option>
              @for (giro of giros(); track giro.id) {
                <option [ngValue]="giro.id">{{ giro.nombre }}</option>
              }
            </select>
          </fg-field>
          <fg-field
            label="Socio propietario"
            [control]="form.controls.socioId"
            ayuda="Opcional: se asigna cuando corresponda."
          >
            <select class="fg-select" formControlName="socioId">
              <option [ngValue]="null">Sin socio asignado</option>
              @for (socio of socios(); track socio.id) {
                <option [ngValue]="socio.id">
                  {{ socio.codigo }} — {{ socio.nombre }} {{ socio.apellidos }}
                </option>
              }
            </select>
          </fg-field>
          <fg-field label="Inquilino" [control]="form.controls.inquilinoNombre">
            <input class="fg-input" formControlName="inquilinoNombre" maxlength="100" />
          </fg-field>
          <fg-field label="Documento del inquilino" [control]="form.controls.inquilinoDocumento">
            <input class="fg-input" formControlName="inquilinoDocumento" maxlength="20" />
          </fg-field>
          <fg-field label="Vigencia inicio" [control]="form.controls.vigenciaInicio">
            <input class="fg-input" type="date" formControlName="vigenciaInicio" />
          </fg-field>
          <fg-field label="Vigencia fin" [control]="form.controls.vigenciaFin">
            <input class="fg-input" type="date" formControlName="vigenciaFin" />
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

    @if (porEliminar(); as puesto) {
      <fg-confirm
        titulo="Eliminar puesto"
        [mensaje]="'Se eliminara el puesto ' + puesto.numero + '.'"
        nota="Si tiene cuentas o recibos asociados, el backend rechazara la operacion."
        textoConfirmar="Eliminar"
        [peligroso]="true"
        (cancelar)="porEliminar.set(null)"
        (confirmar)="eliminar(puesto)"
      />
    }
  `
})
export class PuestosPage {
  private readonly api = inject(PuestoApi);
  private readonly socioApi = inject(SocioApi);
  private readonly giroApi = inject(GiroApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly puestos = signal<Puesto[]>([]);
  protected readonly socios = signal<Socio[]>([]);
  protected readonly giros = signal<Giro[]>([]);
  protected readonly cargando = signal(true);
  protected readonly mostrarForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly editando = signal<Puesto | null>(null);
  protected readonly porEliminar = signal<Puesto | null>(null);

  private readonly textoBusqueda = new Subject<string>();

  protected readonly columnas: Columna<Puesto>[] = [
    { header: 'Numero', value: (p) => p.numero },
    { header: 'Giro', value: (p) => this.nombreGiro(p.giroId) },
    { header: 'Socio', value: (p) => this.nombreSocio(p.socioId) },
    { header: 'Inquilino', value: (p) => p.inquilinoNombre },
    { header: 'Vigencia inicio', value: (p) => p.vigenciaInicio, tipo: 'fecha' },
    { header: 'Vigencia fin', value: (p) => p.vigenciaFin, tipo: 'fecha' }
  ];

  protected readonly form = this.fb.group({
    numero: ['', [Validators.required, Validators.maxLength(20)]],
    giroId: [null as number | null, [Validators.required]],
    socioId: [null as number | null],
    inquilinoNombre: ['', [Validators.maxLength(100)]],
    inquilinoDocumento: ['', [Validators.maxLength(20)]],
    vigenciaInicio: [null as string | null],
    vigenciaFin: [null as string | null]
  });

  constructor() {
    forkJoin({ socios: this.socioApi.listar(), giros: this.giroApi.listar() }).subscribe({
      next: ({ socios, giros }) => {
        this.socios.set(socios);
        this.giros.set(giros);
      }
    });
    this.cargar();

    this.textoBusqueda
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((numero) => (numero ? this.api.buscar(numero) : this.api.listar()))
      )
      .subscribe({
        next: (puestos) => {
          this.puestos.set(puestos);
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
    this.form.reset({ giroId: null, socioId: null });
    this.mostrarForm.set(true);
  }

  protected editar(puesto: Puesto): void {
    this.editando.set(puesto);
    this.form.setValue({
      numero: puesto.numero,
      giroId: puesto.giroId ?? null,
      socioId: puesto.socioId ?? null,
      inquilinoNombre: puesto.inquilinoNombre ?? '',
      inquilinoDocumento: puesto.inquilinoDocumento ?? '',
      vigenciaInicio: puesto.vigenciaInicio ?? null,
      vigenciaFin: puesto.vigenciaFin ?? null
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
    const valores = this.form.getRawValue();
    const puesto: Puesto = {
      numero: valores.numero ?? '',
      giroId: valores.giroId ?? null,
      socioId: valores.socioId ?? null,
      inquilinoNombre: valores.inquilinoNombre || null,
      inquilinoDocumento: valores.inquilinoDocumento || null,
      vigenciaInicio: valores.vigenciaInicio || null,
      vigenciaFin: valores.vigenciaFin || null
    };
    const enEdicion = this.editando();
    this.guardando.set(true);

    const peticion = enEdicion?.id
      ? this.api.editar(enEdicion.id, puesto)
      : this.api.crear(puesto);

    peticion.subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        // El backend responde 200 con cuerpo vacio si el giro o el socio no existen.
        if (!respuesta) {
          this.toast.error('No se pudo guardar', 'Revisa que el giro y el socio existan.');
          return;
        }
        this.mostrarForm.set(false);
        this.toast.success(enEdicion ? 'Puesto actualizado' : 'Puesto registrado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        aplicarErroresServidor(this.form, error);
      }
    });
  }

  protected eliminar(puesto: Puesto): void {
    if (!puesto.id) return;
    this.api.eliminar(puesto.id).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.toast.success('Puesto eliminado');
        this.cargar();
      },
      error: () => this.porEliminar.set(null)
    });
  }

  private nombreGiro(id: number | null | undefined): string {
    return this.giros().find((g) => g.id === id)?.nombre ?? '—';
  }

  private nombreSocio(id: number | null | undefined): string {
    const socio = this.socios().find((s) => s.id === id);
    return socio ? `${socio.nombre} ${socio.apellidos}` : '—';
  }

  private cargar(): void {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (puestos) => {
        this.puestos.set(puestos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
