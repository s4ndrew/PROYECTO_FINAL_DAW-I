import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { mensajeDeError } from '../../core/util/formato';

/**
 * Envoltura de campo: label + control proyectado + mensaje de error.
 * Los mensajes replican las validaciones de Bean Validation del backend.
 */
@Component({
  selector: 'fg-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fg-field">
      <label class="fg-label" [attr.for]="para()">
        {{ label() }}@if (requerido()) {<span aria-hidden="true"> *</span>}
      </label>
      <ng-content />
      @if (mostrarError()) {
        <span class="fg-error-text">{{ error() }}</span>
      } @else if (ayuda()) {
        <span class="fg-help-text">{{ ayuda() }}</span>
      }
    </div>
  `
})
export class FgField {
  readonly label = input.required<string>();
  readonly control = input<AbstractControl | null>(null);
  readonly ayuda = input('');
  readonly requerido = input(false);
  readonly para = input<string | null>(null);

  protected mostrarError(): boolean {
    const c = this.control();
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected error(): string {
    return mensajeDeError(this.control()?.errors);
  }
}
