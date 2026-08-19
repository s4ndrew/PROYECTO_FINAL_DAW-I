import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CuentaCobrarApi, ReciboApi } from '../../core/api/caja.api';
import { BancoApi } from '../../core/api/catalogos.api';
import { AuthService } from '../../core/auth/auth.service';
import { Banco, CuentaCobrar } from '../../core/models';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor, hoyIso } from '../../core/util/formato';
import { FgField } from '../../shared/ui/field';
import { FgPageHeader } from '../../shared/ui/page-header';
import { MonedaPipe } from '../../shared/ui/pipes';

/** RF-24: el backend solo acepta canjes sobre cuentas que pertenecen a un socio. */
@Component({
  selector: 'fg-canje',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FgPageHeader, FgField, MonedaPipe],
  template: `
    <fg-page-header
      titulo="Canje bancario"
      descripcion="Concilia el deposito de un socio y emite el recibo bancario."
    >
      <a class="fg-btn fg-btn--secondary" routerLink="/recibos">Volver</a>
    </fg-page-header>

    <div class="fg-card fg-card__body" style="max-width:720px">
      <div class="fg-alert fg-alert--info" style="margin-bottom:16px">
        Solo aparecen cuentas pendientes que pertenecen a un socio: el backend rechaza el canje de
        cuentas de puesto.
      </div>

      <form [formGroup]="form" class="fg-form-grid" novalidate>
        <fg-field
          label="Cuenta por cobrar"
          [control]="form.controls.cuentaId"
          [requerido]="true"
          class="fg-span-2"
        >
          <select class="fg-select" formControlName="cuentaId">
            <option [ngValue]="null">Selecciona una cuenta</option>
            @for (cuenta of cuentas(); track cuenta.id) {
              <option [ngValue]="cuenta.id">
                #{{ cuenta.id }} — {{ cuenta.socio?.nombre }} {{ cuenta.socio?.apellidos }} —
                {{ cuenta.servicio?.nombre }} — {{ cuenta.periodo }}
              </option>
            }
          </select>
        </fg-field>

        <fg-field label="Banco" [control]="form.controls.bancoId" [requerido]="true">
          <select class="fg-select" formControlName="bancoId">
            <option [ngValue]="null">Selecciona un banco</option>
            @for (banco of bancos(); track banco.id) {
              <option [ngValue]="banco.id">{{ banco.nombre }} — {{ banco.numeroCuenta }}</option>
            }
          </select>
        </fg-field>

        <fg-field
          label="Fecha de deposito"
          [control]="form.controls.fechaDeposito"
          [requerido]="true"
        >
          <input class="fg-input" type="date" formControlName="fechaDeposito" />
        </fg-field>
      </form>

      @if (cuentaElegida(); as cuenta) {
        <div class="resumen">
          <span class="fg-caption">Monto del canje</span>
          <strong>{{ cuenta.monto | moneda }}</strong>
        </div>
      }

      <div class="fg-row" style="margin-top:24px">
        <span class="fg-spacer"></span>
        <a class="fg-btn fg-btn--ghost" routerLink="/recibos">Cancelar</a>
        <button
          type="button"
          class="fg-btn fg-btn--primary"
          [disabled]="enviando()"
          (click)="registrar()"
        >
          @if (enviando()) {
            <span class="fg-spinner"></span>
          }
          Registrar canje
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .resumen {
        margin-top: var(--fg-space-4);
        padding: var(--fg-space-4);
        background: var(--fg-brand-50);
        border-radius: var(--fg-radius-sm);
        display: flex;
        flex-direction: column;
      }
      .resumen strong {
        font: 700 22px/30px var(--fg-font-family);
      }
    `
  ]
})
export class CanjePage {
  private readonly cuentaApi = inject(CuentaCobrarApi);
  private readonly bancoApi = inject(BancoApi);
  private readonly reciboApi = inject(ReciboApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cuentas = signal<CuentaCobrar[]>([]);
  protected readonly bancos = signal<Banco[]>([]);
  protected readonly enviando = signal(false);
  private readonly cuentaIdSeleccionada = signal<number | null>(null);

  protected readonly form = this.fb.group({
    cuentaId: [null as number | null, [Validators.required]],
    bancoId: [null as number | null, [Validators.required]],
    fechaDeposito: [hoyIso(), [Validators.required]]
  });

  protected readonly cuentaElegida = computed(() =>
    this.cuentas().find((c) => c.id === this.cuentaIdSeleccionada())
  );

  constructor() {
    forkJoin({ cuentas: this.cuentaApi.listar(), bancos: this.bancoApi.listar() }).subscribe({
      next: ({ cuentas, bancos }) => {
        this.cuentas.set(cuentas.filter((c) => c.socio && c.estado === 'PENDIENTE'));
        this.bancos.set(bancos);
      }
    });

    this.form.controls.cuentaId.valueChanges.subscribe((id) =>
      this.cuentaIdSeleccionada.set(id ?? null)
    );
  }

  protected registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    this.enviando.set(true);
    this.reciboApi
      .canjear({
        cuentaId: valores.cuentaId!,
        bancoId: valores.bancoId!,
        fechaDeposito: valores.fechaDeposito!,
        usuarioId: this.auth.usuarioId()
      })
      .subscribe({
        next: (recibo) => {
          this.enviando.set(false);
          this.toast.success(
            'Canje registrado',
            `Se emitio el recibo bancario N° ${recibo.correlativo}.`
          );
          void this.router.navigate(['/recibos']);
        },
        error: (error) => {
          this.enviando.set(false);
          aplicarErroresServidor(this.form, error);
        }
      });
  }
}
