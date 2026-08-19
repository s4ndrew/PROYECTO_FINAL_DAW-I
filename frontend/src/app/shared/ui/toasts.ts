import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'fg-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fg-toasts" role="status" aria-live="polite">
      @for (toast of servicio.toasts(); track toast.id) {
        <div class="fg-toast fg-toast--{{ toast.tipo }}">
          <div class="fg-toast__cuerpo">
            <strong>{{ toast.titulo }}</strong>
            @if (toast.detalle) {
              <span class="fg-caption">{{ toast.detalle }}</span>
            }
          </div>
          <button
            type="button"
            class="fg-toast__cerrar"
            aria-label="Cerrar notificacion"
            (click)="servicio.cerrar(toast.id)"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .fg-toasts {
        position: fixed;
        top: var(--fg-space-4);
        right: var(--fg-space-4);
        display: flex;
        flex-direction: column;
        gap: var(--fg-space-2);
        z-index: var(--fg-z-toast);
        max-width: min(380px, calc(100vw - 32px));
      }
      .fg-toast {
        display: flex;
        align-items: flex-start;
        gap: var(--fg-space-3);
        padding: var(--fg-space-3) var(--fg-space-4);
        border-radius: var(--fg-radius-sm);
        background: var(--fg-white);
        border-left: 4px solid var(--fg-neutral-400);
        box-shadow: var(--fg-shadow-md);
      }
      .fg-toast--success {
        border-left-color: var(--fg-success);
      }
      .fg-toast--error {
        border-left-color: var(--fg-danger);
      }
      .fg-toast--warning {
        border-left-color: var(--fg-warning);
      }
      .fg-toast--info {
        border-left-color: var(--fg-info);
      }
      .fg-toast__cuerpo {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }
      .fg-toast__cerrar {
        border: none;
        background: transparent;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        color: var(--fg-text-muted);
      }
    `
  ]
})
export class FgToasts {
  protected readonly servicio = inject(ToastService);
}
