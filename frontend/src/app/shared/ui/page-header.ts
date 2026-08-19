import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'fg-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fg-page-header">
      <div>
        <h1>{{ titulo() }}</h1>
        @if (descripcion()) {
          <p class="fg-text-secondary">{{ descripcion() }}</p>
        }
      </div>
      <div class="fg-page-header__acciones">
        <ng-content />
      </div>
    </header>
  `,
  styles: [
    `
      .fg-page-header {
        display: flex;
        align-items: flex-start;
        gap: var(--fg-space-4);
        flex-wrap: wrap;
        margin-bottom: var(--fg-space-6);
      }
      .fg-page-header > div:first-child {
        flex: 1;
        min-width: 240px;
      }
      .fg-page-header__acciones {
        display: flex;
        gap: var(--fg-space-2);
        flex-wrap: wrap;
      }
    `
  ]
})
export class FgPageHeader {
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>('');
}
