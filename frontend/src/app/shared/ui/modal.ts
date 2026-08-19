import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'fg-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fg-overlay" (click)="cerrar.emit()">
      <div
        class="fg-modal fg-modal--{{ tamanio() }}"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="titulo()"
        (click)="$event.stopPropagation()"
      >
        <div class="fg-modal__head">
          <h2>{{ titulo() }}</h2>
          <button type="button" class="fg-btn fg-btn--ghost fg-btn--sm" (click)="cerrar.emit()">
            Cerrar
          </button>
        </div>
        <div class="fg-modal__body">
          <ng-content />
        </div>
        <div class="fg-modal__foot">
          <ng-content select="[modalFooter]" />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .fg-overlay {
        position: fixed;
        inset: 0;
        background: rgba(16, 24, 40, 0.45);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: var(--fg-space-8) var(--fg-space-4);
        overflow-y: auto;
        z-index: var(--fg-z-modal);
      }
      .fg-modal {
        background: var(--fg-bg-card);
        border-radius: var(--fg-radius-lg);
        box-shadow: var(--fg-shadow-modal);
        width: 100%;
        max-width: 640px;
        display: flex;
        flex-direction: column;
      }
      .fg-modal--sm {
        max-width: 480px;
      }
      .fg-modal--lg {
        max-width: 860px;
      }
      .fg-modal__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--fg-space-4);
        padding: var(--fg-space-4) var(--fg-space-6);
        border-bottom: 1px solid var(--fg-border-soft);
      }
      .fg-modal__head h2 {
        font: 600 18px/26px var(--fg-font-family);
      }
      .fg-modal__body {
        padding: var(--fg-space-6);
      }
      .fg-modal__foot {
        display: flex;
        justify-content: flex-end;
        gap: var(--fg-space-2);
        padding: var(--fg-space-4) var(--fg-space-6);
        border-top: 1px solid var(--fg-border-soft);
      }
      .fg-modal__foot:empty {
        display: none;
      }
    `
  ]
})
export class FgModal {
  readonly titulo = input.required<string>();
  readonly tamanio = input<'sm' | 'md' | 'lg'>('md');
  readonly cerrar = output<void>();
}
