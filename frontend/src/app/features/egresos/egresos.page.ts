import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { EgresoApi } from '../../core/api/egresos.api';
import { BancoApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { Banco, Egreso } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor, hoyIso } from '../../core/util/formato';
import { FgConfirm } from '../../shared/ui/confirm';
import { FgField } from '../../shared/ui/field';
import { FgModal } from '../../shared/ui/modal';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

type ModoLista = 'todos' | 'fecha' | 'categoria';

/** RF-27, RF-28, RF-30: salidas de dinero de la administracion. */
@Component({
  selector: 'fg-egresos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FgPageHeader, FgTable, FgModal, FgField, FgConfirm],
  template: `
    <fg-page-header titulo="Egresos" descripcion="Pagos a proveedores y gastos de la galeria.">
      <button type="button" class="fg-btn fg-btn--primary" (click)="abrirNuevo()">
        Nuevo egreso
      </button>
    </fg-page-header>

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="egresos()"
        [cargando]="cargando()"
        [tieneFiltros]="true"
        [tamanioPagina]="15"
        placeholder="Buscar por proveedor o motivo..."
        vacioTitulo="Todavia no hay egresos"
        vacioTexto="Registra el primer pago a proveedor para verlo aqui."
      >
        <select
          tablaFiltros
          class="fg-select"
          style="max-width:190px"
          aria-label="Modo de listado"
          [value]="modo()"
          (change)="cambiarModo($any($event.target).value)"
        >
          <option value="todos">Todos</option>
          <option value="fecha">Por rango de fecha</option>
          <option value="categoria">Por categoria</option>
        </select>
        @if (modo() === 'fecha') {
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
        @if (modo() === 'categoria') {
          <ng-container tablaFiltros>
            <input
              class="fg-input"
              style="max-width:220px"
              placeholder="Categoria exacta..."
              aria-label="Categoria"
              [value]="categoria()"
              (change)="categoria.set($any($event.target).value); cargar()"
            />
          </ng-container>
        }

        <ng-template #acciones let-egreso>
          <button type="button" class="fg-btn fg-btn--ghost fg-btn--sm" (click)="editar(egreso)">
            Editar
          </button>
          <button
            type="button"
            class="fg-btn fg-btn--ghost fg-btn--sm"
            (click)="porEliminar.set(egreso)"
          >
            Eliminar
          </button>
        </ng-template>
      </fg-table>
    </div>

    @if (mostrarForm()) {
      <fg-modal
        [titulo]="editando() ? 'Editar egreso' : 'Nuevo egreso'"
        tamanio="lg"
        (cerrar)="cerrarForm()"
      >
        <form [formGroup]="form" class="fg-form-grid" novalidate>
          <fg-field
            label="Tipo de documento"
            [control]="form.controls.tipo"
            [requerido]="true"
            ayuda="Factura, boleta, recibo por honorarios..."
          >
            <input class="fg-input" formControlName="tipo" />
          </fg-field>
          <fg-field label="Correlativo" [control]="form.controls.correlativo">
            <input class="fg-input" type="number" formControlName="correlativo" />
          </fg-field>
          <fg-field label="Proveedor" [control]="form.controls.proveedor" [requerido]="true">
            <input class="fg-input" formControlName="proveedor" />
          </fg-field>
          <fg-field label="Fecha" [control]="form.controls.fecha" [requerido]="true">
            <input class="fg-input" type="date" formControlName="fecha" />
          </fg-field>
          <fg-field label="Subtotal" [control]="form.controls.subtotal" [requerido]="true">
            <input class="fg-input" type="number" step="0.01" min="0.01" formControlName="subtotal" />
          </fg-field>
          <fg-field label="IGV" [control]="form.controls.igv">
            <input class="fg-input" type="number" step="0.01" min="0" formControlName="igv" />
          </fg-field>
          <fg-field label="Total" [control]="form.controls.total" [requerido]="true">
            <input class="fg-input" type="number" step="0.01" min="0.01" formControlName="total" />
          </fg-field>
          <fg-field label="Categoria" [control]="form.controls.categoria">
            <input class="fg-input" formControlName="categoria" />
          </fg-field>
          <fg-field label="Banco" [control]="form.controls.bancoId">
            <select class="fg-select" formControlName="bancoId">
              <option [ngValue]="null">Sin banco</option>
              @for (banco of bancos(); track banco.id) {
                <option [ngValue]="banco.id">{{ banco.nombre }}</option>
              }
            </select>
          </fg-field>
          <fg-field label="Motivo" [control]="form.controls.motivo" [requerido]="true" class="fg-span-2">
            <textarea class="fg-textarea" formControlName="motivo"></textarea>
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

    @if (porEliminar(); as egreso) {
      <fg-confirm
        titulo="Eliminar egreso"
        [mensaje]="'Se eliminara el egreso de ' + egreso.proveedor + '.'"
        nota="La eliminacion queda registrada en auditoria con tu usuario."
        textoConfirmar="Eliminar"
        [peligroso]="true"
        (cancelar)="porEliminar.set(null)"
        (confirmar)="eliminar(egreso)"
      />
    }
  `
})
export class EgresosPage {
  private readonly api = inject(EgresoApi);
  private readonly bancoApi = inject(BancoApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly egresos = signal<Egreso[]>([]);
  protected readonly bancos = signal<Banco[]>([]);
  protected readonly cargando = signal(true);
  protected readonly mostrarForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly editando = signal<Egreso | null>(null);
  protected readonly porEliminar = signal<Egreso | null>(null);

  protected readonly modo = signal<ModoLista>('todos');
  protected readonly fechaInicio = signal(hoyIso());
  protected readonly fechaFin = signal(hoyIso());
  protected readonly categoria = signal('');

  protected readonly columnas: Columna<Egreso>[] = [
    { header: 'Tipo', value: (e) => e.tipo },
    { header: 'Correlativo', value: (e) => e.correlativo },
    { header: 'Proveedor', value: (e) => e.proveedor },
    { header: 'Fecha', value: (e) => e.fecha, tipo: 'fecha' },
    { header: 'Categoria', value: (e) => e.categoria },
    { header: 'Subtotal', value: (e) => e.subtotal, tipo: 'moneda', align: 'right' },
    { header: 'IGV', value: (e) => e.igv, tipo: 'moneda', align: 'right' },
    { header: 'Total', value: (e) => e.total, tipo: 'moneda', align: 'right' }
  ];

  protected readonly form = this.fb.group({
    tipo: ['', [Validators.required]],
    correlativo: [null as number | null],
    proveedor: ['', [Validators.required]],
    fecha: [hoyIso(), [Validators.required]],
    subtotal: [null as number | null, [Validators.required, Validators.min(0.01)]],
    igv: [null as number | null, [Validators.min(0)]],
    total: [null as number | null, [Validators.required, Validators.min(0.01)]],
    motivo: ['', [Validators.required]],
    categoria: [''],
    bancoId: [null as number | null]
  });

  constructor() {
    this.cargar();
    this.bancoApi.listar().subscribe({ next: (bancos) => this.bancos.set(bancos) });
  }

  protected cambiarModo(modo: ModoLista): void {
    this.modo.set(modo);
    this.cargar();
  }

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset({ fecha: hoyIso(), bancoId: null });
    this.mostrarForm.set(true);
  }

  protected editar(egreso: Egreso): void {
    this.editando.set(egreso);
    this.form.setValue({
      tipo: egreso.tipo ?? '',
      correlativo: egreso.correlativo ?? null,
      proveedor: egreso.proveedor,
      fecha: egreso.fecha,
      subtotal: egreso.subtotal ?? null,
      igv: egreso.igv ?? null,
      total: egreso.total,
      motivo: egreso.motivo ?? '',
      categoria: egreso.categoria ?? '',
      bancoId: egreso.bancoId ?? null
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
    const egreso: Egreso = {
      tipo: valores.tipo,
      correlativo: valores.correlativo,
      proveedor: valores.proveedor ?? '',
      fecha: valores.fecha ?? hoyIso(),
      subtotal: valores.subtotal,
      igv: valores.igv,
      total: valores.total ?? 0,
      motivo: valores.motivo,
      categoria: valores.categoria || null,
      bancoId: valores.bancoId,
      // RNF-14: el backend audita el egreso con el usuario que lo registra.
      usuarioId: this.auth.usuarioId()
    };
    const enEdicion = this.editando();
    this.guardando.set(true);

    const peticion = enEdicion?.id
      ? this.api.actualizar(enEdicion.id, egreso)
      : this.api.registrar(egreso);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.toast.success(enEdicion ? 'Egreso actualizado' : 'Egreso registrado');
        this.cargar();
      },
      error: (error) => {
        this.guardando.set(false);
        aplicarErroresServidor(this.form, error);
      }
    });
  }

  protected eliminar(egreso: Egreso): void {
    if (!egreso.id) return;
    this.api.eliminar(egreso.id, this.auth.usuarioId()).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.toast.success('Egreso eliminado', 'La accion quedo registrada en auditoria.');
        this.cargar();
      },
      error: () => this.porEliminar.set(null)
    });
  }

  protected cargar(): void {
    this.cargando.set(true);
    const peticion =
      this.modo() === 'fecha'
        ? this.api.listarPorFecha(this.fechaInicio(), this.fechaFin())
        : this.modo() === 'categoria' && this.categoria()
          ? this.api.listarPorCategoria(this.categoria())
          : this.api.listar();

    peticion.subscribe({
      next: (egresos) => {
        this.egresos.set(egresos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
