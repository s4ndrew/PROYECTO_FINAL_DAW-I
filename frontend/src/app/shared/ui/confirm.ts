import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { FgModal } from './modal';

@Component({
  selector: 'fg-confirm',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FgModal],
  template: `
    <fg-modal [titulo]="titulo()" tamanio="sm" (cerrar)="cancelar.emit()">
      <p>{{ mensaje() }}</p>
      @if (nota()) {
        <p class="fg-caption" style="margin-top:8px">{{ nota() }}</p>
      }
      <div modalFooter>
        <button type="button" class="fg-btn fg-btn--ghost" (click)="cancelar.emit()">
          Cancelar
        </button>
        <button
          type="button"
          class="fg-btn"
          [class.fg-btn--danger]="peligroso()"
          [class.fg-btn--primary]="!peligroso()"
          [disabled]="procesando()"
          (click)="confirmar.emit()"
        >
          @if (procesando()) {
            <span class="fg-spinner"></span>
          }
          {{ textoConfirmar() }}
        </button>
      </div>
    </fg-modal>
  `
})
export class FgConfirm {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly nota = input<string>('');
  readonly textoConfirmar = input('Confirmar');
  readonly peligroso = input(false);
  readonly procesando = input(false);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
