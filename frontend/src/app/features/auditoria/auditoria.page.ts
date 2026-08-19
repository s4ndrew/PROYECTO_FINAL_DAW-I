import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuditoriaApi, UsuarioApi } from '../../core/api/sistema.api';
import { Auditoria, Usuario } from '../../core/models';
import { FgPageHeader } from '../../shared/ui/page-header';
import { Columna, FgTable } from '../../shared/ui/table';

const ENTIDADES = ['CuentaCobrar', 'Recibo', 'Egreso', 'ComprobanteEgreso'];

/** RNF-14: quien hizo que y cuando. Solo ADMIN. */
@Component({
  selector: 'fg-auditoria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FgPageHeader, FgTable],
  template: `
    <fg-page-header
      titulo="Auditoria"
      descripcion="Registro centralizado de las operaciones sensibles del sistema."
    />

    <div class="fg-card">
      <fg-table
        [columnas]="columnas"
        [filas]="registros()"
        [cargando]="cargando()"
        [tieneFiltros]="true"
        [tamanioPagina]="20"
        placeholder="Buscar en el detalle..."
        vacioTitulo="Sin registros de auditoria"
        vacioTexto="Las operaciones sensibles apareceran aqui apenas ocurran."
      >
        <select
          tablaFiltros
          class="fg-select"
          style="max-width:200px"
          aria-label="Filtrar por entidad"
          [(ngModel)]="entidad"
          (ngModelChange)="cargar()"
        >
          <option value="">Todas las entidades</option>
          @for (opcion of entidades; track opcion) {
            <option [value]="opcion">{{ opcion }}</option>
          }
        </select>
        <select
          tablaFiltros
          class="fg-select"
          style="max-width:220px"
          aria-label="Filtrar por usuario"
          [(ngModel)]="usuarioId"
          (ngModelChange)="cargar()"
        >
          <option [ngValue]="null">Todos los usuarios</option>
          @for (usuario of usuarios(); track usuario.id) {
            <option [ngValue]="usuario.id">{{ usuario.usuario }}</option>
          }
        </select>
      </fg-table>
    </div>
  `
})
export class AuditoriaPage {
  private readonly api = inject(AuditoriaApi);
  private readonly usuarioApi = inject(UsuarioApi);

  protected readonly entidades = ENTIDADES;
  protected entidad = '';
  protected usuarioId: number | null = null;

  protected readonly registros = signal<Auditoria[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(true);

  protected readonly columnas: Columna<Auditoria>[] = [
    { header: 'Fecha', value: (a) => a.fecha, tipo: 'fechaHora' },
    { header: 'Usuario', value: (a) => a.usuarioNombre ?? a.usuarioId },
    { header: 'Entidad', value: (a) => a.entidad },
    { header: 'ID', value: (a) => a.entidadId },
    { header: 'Accion', value: (a) => a.accion, tipo: 'chip' },
    { header: 'Detalle', value: (a) => a.detalle }
  ];

  constructor() {
    this.cargar();
    this.usuarioApi.listar().subscribe({ next: (usuarios) => this.usuarios.set(usuarios) });
  }

  protected cargar(): void {
    this.cargando.set(true);
    const peticion = this.usuarioId
      ? this.api.listarPorUsuario(this.usuarioId)
      : this.entidad
        ? this.api.listarPorEntidad(this.entidad)
        : this.api.listar();

    peticion.subscribe({
      next: (registros) => {
        this.registros.set(registros);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
