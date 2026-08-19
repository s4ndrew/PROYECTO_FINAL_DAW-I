import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ReciboApi } from '../../core/api/caja.api';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/ui/toast.service';
import { aplicarErroresServidor } from '../../core/util/formato';
import { FgField } from '../../shared/ui/field';
import { FgPageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'fg-ingreso-externo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FgPageHeader, FgField],
  template: `
    <fg-page-header
      titulo="Ingreso externo"
      descripcion="Registra un ingreso que no proviene de una cuenta por cobrar."
    >
      <a class="fg-btn fg-btn--secondary" routerLink="/recibos">Volver</a>
    </fg-page-header>

    <div class="fg-card fg-card__body" style="max-width:720px">
      <form [formGroup]="form" class="fg-form-grid" novalidate>
        <fg-field label="Depositante" [control]="form.controls.depositante" [requerido]="true">
          <input class="fg-input" formControlName="depositante" />
        </fg-field>
        <fg-field label="Categoria" [control]="form.controls.categoria">
          <input class="fg-input" formControlName="categoria" placeholder="Donacion, subvencion..." />
        </fg-field>
        <fg-field
          label="Monto"
          [control]="form.controls.monto"
          [requerido]="true"
          ayuda="Debe ser mayor a 0."
        >
          <input class="fg-input" type="number" step="0.01" min="0.01" formControlName="monto" />
        </fg-field>
        <fg-field label="Concepto" [control]="form.controls.concepto" class="fg-span-2">
          <textarea class="fg-textarea" formControlName="concepto"></textarea>
        </fg-field>
      </form>

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
          Registrar ingreso
        </button>
      </div>
    </div>
  `
})
export class IngresoExternoPage {
  private readonly api = inject(ReciboApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    depositante: ['', [Validators.required]],
    categoria: [''],
    concepto: [''],
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]]
  });

  protected registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    this.enviando.set(true);
    this.api
      .registrarIngresoExterno({
        depositante: valores.depositante,
        categoria: valores.categoria,
        concepto: valores.concepto,
        monto: valores.monto!,
        usuarioId: this.auth.usuarioId()
      })
      .subscribe({
        next: (recibo) => {
          this.enviando.set(false);
          this.toast.success(
            'Ingreso registrado',
            `Se emitio el recibo N° ${recibo.correlativo}.`
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
