import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { ReporteApi } from '../../core/api/egresos.api';
import { ToastService } from '../../core/ui/toast.service';
import { descargarBlob, hoyIso } from '../../core/util/formato';
import { FgPageHeader } from '../../shared/ui/page-header';

/**
 * RF-32 y RF-33. Todos los endpoints devuelven XLSX binario; el nombre del
 * archivo lo arma el front porque Content-Disposition no esta expuesto por CORS.
 */
@Component({
  selector: 'fg-reportes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FgPageHeader],
  template: `
    <fg-page-header
      titulo="Reportes"
      descripcion="Descarga en Excel los movimientos de caja y los listados del catalogo."
    />

    <div class="rejilla">
      <article class="fg-card fg-card__body">
        <h3>Recibos del dia</h3>
        <p class="fg-caption">Ingresos registrados en una fecha (RF-32).</p>
        <input class="fg-input" type="date" [(ngModel)]="fechaDiario" />
        <button
          type="button"
          class="fg-btn fg-btn--primary"
          [disabled]="ocupado() === 'diario'"
          (click)="descargar('diario', api.recibosDiario(fechaDiario), 'recibos_' + fechaDiario)"
        >
          Exportar Excel
        </button>
      </article>

      <article class="fg-card fg-card__body">
        <h3>Recibos del mes</h3>
        <p class="fg-caption">Ingresos y bancarios de un mes completo (RF-32).</p>
        <input class="fg-input" type="month" [(ngModel)]="mesRecibos" />
        <button
          type="button"
          class="fg-btn fg-btn--primary"
          [disabled]="ocupado() === 'mensual'"
          (click)="descargarMensual()"
        >
          Exportar Excel
        </button>
      </article>

      <article class="fg-card fg-card__body">
        <h3>Egresos por fecha</h3>
        <p class="fg-caption">Rango de fechas de egresos (RF-32).</p>
        <div class="fg-row">
          <input class="fg-input" type="date" [(ngModel)]="egresoInicio" />
          <input class="fg-input" type="date" [(ngModel)]="egresoFin" />
        </div>
        <button
          type="button"
          class="fg-btn fg-btn--primary"
          [disabled]="ocupado() === 'egresos-fecha'"
          (click)="
            descargar(
              'egresos-fecha',
              api.egresosPorFecha(egresoInicio, egresoFin),
              'egresos_' + egresoInicio + '_a_' + egresoFin
            )
          "
        >
          Exportar Excel
        </button>
      </article>

      <article class="fg-card fg-card__body">
        <h3>Egresos por categoria</h3>
        <p class="fg-caption">Egresos de una categoria exacta (RF-32).</p>
        <input class="fg-input" placeholder="Categoria" [(ngModel)]="categoria" />
        <button
          type="button"
          class="fg-btn fg-btn--primary"
          [disabled]="ocupado() === 'egresos-categoria' || !categoria"
          (click)="
            descargar(
              'egresos-categoria',
              api.egresosPorCategoria(categoria),
              'egresos_' + categoria
            )
          "
        >
          Exportar Excel
        </button>
      </article>

      <article class="fg-card fg-card__body">
        <h3>Socios</h3>
        <p class="fg-caption">Listado completo del catalogo de socios (RF-33).</p>
        <button
          type="button"
          class="fg-btn fg-btn--secondary"
          [disabled]="ocupado() === 'socios'"
          (click)="descargar('socios', api.socios(), 'socios')"
        >
          Exportar Excel
        </button>
      </article>

      <article class="fg-card fg-card__body">
        <h3>No socios</h3>
        <p class="fg-caption">Ingresos externos, no ligados a un socio (RF-33).</p>
        <button
          type="button"
          class="fg-btn fg-btn--secondary"
          [disabled]="ocupado() === 'no-socios'"
          (click)="descargar('no-socios', api.noSocios(), 'no_socios')"
        >
          Exportar Excel
        </button>
      </article>

      <article class="fg-card fg-card__body">
        <h3>Bancos</h3>
        <p class="fg-caption">Listado completo de cuentas bancarias (RF-33).</p>
        <button
          type="button"
          class="fg-btn fg-btn--secondary"
          [disabled]="ocupado() === 'bancos'"
          (click)="descargar('bancos', api.bancos(), 'bancos')"
        >
          Exportar Excel
        </button>
      </article>
    </div>
  `,
  styles: [
    `
      .rejilla {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--fg-space-4);
      }
      .rejilla article {
        display: flex;
        flex-direction: column;
        gap: var(--fg-space-3);
      }
      .rejilla button {
        margin-top: auto;
        align-self: flex-start;
      }
    `
  ]
})
export class ReportesPage {
  protected readonly api = inject(ReporteApi);
  private readonly toast = inject(ToastService);

  protected readonly ocupado = signal<string | null>(null);

  protected fechaDiario = hoyIso();
  protected mesRecibos = hoyIso().slice(0, 7);
  protected egresoInicio = hoyIso().slice(0, 8) + '01';
  protected egresoFin = hoyIso();
  protected categoria = '';

  protected descargarMensual(): void {
    const [anio, mes] = this.mesRecibos.split('-');
    this.descargar(
      'mensual',
      this.api.recibosMensual(Number(anio), Number(mes)),
      `recibos_${this.mesRecibos}`
    );
  }

  protected descargar(clave: string, peticion: Observable<Blob>, nombre: string): void {
    this.ocupado.set(clave);
    peticion.subscribe({
      next: (blob) => {
        this.ocupado.set(null);
        descargarBlob(blob, `reporte_${nombre}.xlsx`);
        this.toast.success('Reporte descargado', `reporte_${nombre}.xlsx`);
      },
      error: () => this.ocupado.set(null)
    });
  }
}
