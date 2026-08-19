import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'fg-no-encontrada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="vacio">
      <img src="brand/isotipo.svg" alt="" width="72" height="72" />
      <h1>Esta pagina no existe</h1>
      <p class="fg-text-secondary">Revisa la direccion o vuelve al inicio.</p>
      <a class="fg-btn fg-btn--primary" routerLink="/inicio">Volver al inicio</a>
    </div>
  `,
  styles: [
    `
      .vacio {
        min-height: 60dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--fg-space-3);
        text-align: center;
      }
    `
  ]
})
export class NoEncontradaPage {}
