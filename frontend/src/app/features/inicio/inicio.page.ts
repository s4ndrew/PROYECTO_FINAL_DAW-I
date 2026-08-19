import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CuentaCobrarApi, ReciboApi } from '../../core/api/caja.api';
import { AuthService } from '../../core/auth/auth.service';
import { CuentaCobrar, Recibo } from '../../core/models';
import { hoyIso } from '../../core/util/formato';
import { FgPageHeader } from '../../shared/ui/page-header';
import { MonedaPipe } from '../../shared/ui/pipes';

/**
 * Resumen del dia. No hay endpoint de KPIs en el backend: los cuatro numeros se
 * derivan en cliente de /cuentas-cobrar y /recibos/ingresos?fecha=hoy.
 */
@Component({
  selector: 'fg-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FgPageHeader],
  template: `
    <fg-page-header
      [titulo]="'Hola, ' + auth.sesion()?.nombres + '.'"
      descripcion="Esto es lo que esta pasando hoy en la galeria."
    />

    <section class="kpis">
      @for (kpi of tarjetas(); track kpi.etiqueta) {
        <article class="fg-card kpi">
          <span class="fg-caption">{{ kpi.etiqueta }}</span>
          @if (cargando()) {
            <div class="fg-skeleton" style="height:28px;width:60%"></div>
          } @else {
            <strong>{{ kpi.valor }}</strong>
          }
        </article>
      }
    </section>

    <section class="accesos">
      <a class="fg-card acceso" routerLink="/cobranza">
        <strong>Registrar un pago</strong>
        <span class="fg-caption">Selecciona cuentas pendientes y emite el recibo.</span>
      </a>
      <a class="fg-card acceso" routerLink="/cuentas-cobrar">
        <strong>Generar cuentas por cobrar</strong>
        <span class="fg-caption">Mensualidad fija, consumo de luz o cargo a socios.</span>
      </a>
      <a class="fg-card acceso" routerLink="/reportes">
        <strong>Descargar reportes</strong>
        <span class="fg-caption">Recibos, egresos, socios y bancos en Excel.</span>
      </a>
    </section>
  `,
  styles: [
    `
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: var(--fg-space-4);
        margin-bottom: var(--fg-space-6);
      }
      .kpi {
        padding: var(--fg-space-6);
        display: flex;
        flex-direction: column;
        gap: var(--fg-space-2);
      }
      .kpi strong {
        font: 700 26px/34px var(--fg-font-family);
      }
      .accesos {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--fg-space-4);
      }
      .acceso {
        padding: var(--fg-space-5);
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: inherit;
      }
      .acceso:hover {
        border-color: var(--fg-brand-500);
        text-decoration: none;
      }
      @media (max-width: 1023px) {
        .kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .accesos {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 575px) {
        .kpis {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class InicioPage {
  protected readonly auth = inject(AuthService);
  private readonly cuentasApi = inject(CuentaCobrarApi);
  private readonly recibosApi = inject(ReciboApi);
  private readonly moneda = new MonedaPipe();

  protected readonly cargando = signal(true);
  private readonly cuentas = signal<CuentaCobrar[]>([]);
  private readonly recibosHoy = signal<Recibo[]>([]);

  protected readonly tarjetas = computed(() => {
    const pendientes = this.cuentas().filter((c) => c.estado === 'PENDIENTE');
    const montoPendiente = pendientes.reduce((total, c) => total + (c.monto ?? 0), 0);
    const cobradoHoy = this.recibosHoy().reduce((total, r) => total + (r.monto ?? 0), 0);
    return [
      { etiqueta: 'Cuentas pendientes', valor: String(pendientes.length) },
      { etiqueta: 'Monto por cobrar', valor: this.moneda.transform(montoPendiente) },
      { etiqueta: 'Recibos de hoy', valor: String(this.recibosHoy().length) },
      { etiqueta: 'Cobrado hoy', valor: this.moneda.transform(cobradoHoy) }
    ];
  });

  constructor() {
    forkJoin({
      cuentas: this.cuentasApi.listar(),
      recibos: this.recibosApi.listarIngresosPorFecha(hoyIso())
    }).subscribe({
      next: ({ cuentas, recibos }) => {
        this.cuentas.set(cuentas);
        this.recibosHoy.set(recibos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
