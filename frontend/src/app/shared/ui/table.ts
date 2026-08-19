import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import {
  formatearFecha,
  formatearFechaHora,
  formatearMoneda,
  formatearPeriodo
} from '../../core/util/formato';
import { FgChip } from './chip';

export interface Columna<T> {
  header: string;
  value: (fila: T) => string | number | boolean | null | undefined;
  tipo?: 'texto' | 'moneda' | 'fecha' | 'fechaHora' | 'periodo' | 'chip';
  align?: 'left' | 'right';
}

/**
 * Tabla generica. El backend no pagina ni ordena (todos los endpoints devuelven
 * la lista completa), asi que la busqueda, el orden y la paginacion son en cliente.
 * Las acciones por fila se proyectan con <ng-template #acciones let-fila>.
 */
@Component({
  selector: 'fg-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, FgChip],
  template: `
    @if (buscador() || tieneFiltros()) {
      <div class="fg-toolbar">
        @if (buscador()) {
          <input
            class="fg-input fg-search"
            type="search"
            [attr.aria-label]="placeholder()"
            [placeholder]="placeholder()"
            [value]="busqueda()"
            (input)="alBuscar($event)"
          />
        }
        <ng-content select="[tablaFiltros]" />
        <span class="fg-spacer"></span>
        <ng-content select="[tablaAcciones]" />
      </div>
    }

    @if (cargando()) {
      <div class="fg-card__body fg-col">
        @for (i of esqueleto; track i) {
          <div class="fg-skeleton"></div>
        }
      </div>
    } @else if (error()) {
      <div class="fg-state">
        <p class="fg-state__title">No pudimos cargar esta informacion</p>
        <p>{{ error() }}</p>
      </div>
    } @else if (filas().length === 0) {
      <div class="fg-state">
        <p class="fg-state__title">{{ vacioTitulo() }}</p>
        <p>{{ vacioTexto() }}</p>
      </div>
    } @else if (filtradas().length === 0) {
      <div class="fg-state">
        <p class="fg-state__title">Sin resultados</p>
        <p>Ningun registro coincide con "{{ busqueda() }}".</p>
      </div>
    } @else {
      <div class="fg-table-wrap">
        <table class="fg-table">
          <thead>
            <tr>
              @if (seleccionable()) {
                <th style="width:44px">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todo"
                    [checked]="todasSeleccionadas()"
                    (change)="alternarTodas()"
                  />
                </th>
              }
              @for (col of columnas(); track $index) {
                <th
                  class="is-sortable"
                  [class.fg-right]="col.align === 'right'"
                  (click)="ordenarPor($index)"
                >
                  {{ col.header }}
                  @if (ordenIndice() === $index) {
                    <span aria-hidden="true">{{ ordenAsc() ? '▲' : '▼' }}</span>
                  }
                </th>
              }
              @if (accionesTpl()) {
                <th class="fg-right">Acciones</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (fila of pagina(); track $index) {
              <tr>
                @if (seleccionable()) {
                  <td>
                    <input
                      type="checkbox"
                      aria-label="Seleccionar fila"
                      [checked]="estaSeleccionada(fila)"
                      (change)="alternar(fila)"
                    />
                  </td>
                }
                @for (col of columnas(); track $index) {
                  <td [class.fg-right]="col.align === 'right'">
                    @if (col.tipo === 'chip') {
                      <fg-chip [valor]="valorCrudo(col, fila)" />
                    } @else {
                      {{ formatear(col, fila) }}
                    }
                  </td>
                }
                @if (accionesTpl()) {
                  <td>
                    <div class="fg-cell-actions">
                      <ng-container
                        [ngTemplateOutlet]="accionesTpl()!"
                        [ngTemplateOutletContext]="{ $implicit: fila }"
                      />
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPaginas() > 1) {
        <div class="fg-paginacion">
          <span class="fg-caption">
            Mostrando {{ desde() + 1 }}–{{ hasta() }} de {{ filtradas().length }} resultados
          </span>
          <span class="fg-spacer"></span>
          <button
            type="button"
            class="fg-btn fg-btn--ghost fg-btn--sm"
            [disabled]="paginaActual() === 1"
            (click)="irA(paginaActual() - 1)"
          >
            Anterior
          </button>
          <span class="fg-caption">{{ paginaActual() }} / {{ totalPaginas() }}</span>
          <button
            type="button"
            class="fg-btn fg-btn--ghost fg-btn--sm"
            [disabled]="paginaActual() === totalPaginas()"
            (click)="irA(paginaActual() + 1)"
          >
            Siguiente
          </button>
        </div>
      }
    }
  `,
  styles: [
    `
      .fg-paginacion {
        display: flex;
        align-items: center;
        gap: var(--fg-space-3);
        padding: var(--fg-space-3) var(--fg-space-6);
        border-top: 1px solid var(--fg-border-soft);
        flex-wrap: wrap;
      }
    `
  ]
})
export class FgTable<T> {
  readonly columnas = input.required<Columna<T>[]>();
  readonly filas = input.required<T[]>();
  readonly cargando = input(false);
  readonly error = input<string | null>(null);
  readonly buscador = input(true);
  readonly tieneFiltros = input(false);
  readonly placeholder = input('Buscar...');
  readonly tamanioPagina = input(10);
  readonly vacioTitulo = input('Todavia no hay registros');
  readonly vacioTexto = input('Cuando existan, apareceran en esta tabla.');
  readonly seleccionable = input(false);

  readonly seleccionCambio = output<T[]>();

  readonly accionesTpl = contentChild<TemplateRef<{ $implicit: T }>>('acciones');

  protected readonly esqueleto = [1, 2, 3, 4, 5];

  protected readonly busqueda = signal('');
  protected readonly ordenIndice = signal<number | null>(null);
  protected readonly ordenAsc = signal(true);
  protected readonly paginaActual = signal(1);
  private readonly seleccion = signal<T[]>([]);

  constructor() {
    // Al recargar los datos se reinician pagina y seleccion.
    effect(() => {
      this.filas();
      this.paginaActual.set(1);
      this.seleccion.set([]);
    });
  }

  protected readonly filtradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const columnas = this.columnas();
    let datos = [...this.filas()];

    if (texto) {
      datos = datos.filter((fila) =>
        columnas.some((col) =>
          String(col.value(fila) ?? '')
            .toLowerCase()
            .includes(texto)
        )
      );
    }

    const indice = this.ordenIndice();
    if (indice !== null && columnas[indice]) {
      const col = columnas[indice];
      const signo = this.ordenAsc() ? 1 : -1;
      datos.sort((a, b) => {
        const va = col.value(a);
        const vb = col.value(b);
        if (va === vb) return 0;
        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * signo;
        return String(va).localeCompare(String(vb), 'es') * signo;
      });
    }
    return datos;
  });

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtradas().length / this.tamanioPagina()))
  );
  protected readonly desde = computed(() => (this.paginaActual() - 1) * this.tamanioPagina());
  protected readonly hasta = computed(() =>
    Math.min(this.desde() + this.tamanioPagina(), this.filtradas().length)
  );
  protected readonly pagina = computed(() => this.filtradas().slice(this.desde(), this.hasta()));
  protected readonly todasSeleccionadas = computed(
    () => this.pagina().length > 0 && this.pagina().every((f) => this.seleccion().includes(f))
  );

  protected alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
    this.paginaActual.set(1);
  }

  protected ordenarPor(indice: number): void {
    if (this.ordenIndice() === indice) {
      this.ordenAsc.update((asc) => !asc);
    } else {
      this.ordenIndice.set(indice);
      this.ordenAsc.set(true);
    }
  }

  protected irA(pagina: number): void {
    this.paginaActual.set(Math.min(Math.max(1, pagina), this.totalPaginas()));
  }

  protected estaSeleccionada(fila: T): boolean {
    return this.seleccion().includes(fila);
  }

  protected alternar(fila: T): void {
    this.seleccion.update((actual) =>
      actual.includes(fila) ? actual.filter((f) => f !== fila) : [...actual, fila]
    );
    this.seleccionCambio.emit(this.seleccion());
  }

  protected alternarTodas(): void {
    const pagina = this.pagina();
    this.seleccion.update((actual) =>
      this.todasSeleccionadas()
        ? actual.filter((f) => !pagina.includes(f))
        : [...actual, ...pagina.filter((f) => !actual.includes(f))]
    );
    this.seleccionCambio.emit(this.seleccion());
  }

  protected valorCrudo(col: Columna<T>, fila: T): string | boolean | null {
    const valor = col.value(fila);
    if (typeof valor === 'boolean') return valor;
    return valor === null || valor === undefined ? null : String(valor);
  }

  protected formatear(col: Columna<T>, fila: T): string {
    const valor = col.value(fila);
    if (valor === null || valor === undefined || valor === '') {
      return '—';
    }
    switch (col.tipo) {
      case 'moneda':
        return formatearMoneda(Number(valor));
      case 'fecha':
        return formatearFecha(String(valor));
      case 'fechaHora':
        return formatearFechaHora(String(valor));
      case 'periodo':
        return formatearPeriodo(String(valor));
      default:
        return String(valor);
    }
  }
}
