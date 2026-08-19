import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { FgToasts } from '../../shared/ui/toasts';
import { AuthService } from '../auth/auth.service';

interface ItemNav {
  etiqueta: string;
  ruta: string;
  soloAdmin?: boolean;
}

interface GrupoNav {
  titulo: string;
  items: ItemNav[];
}

const NAVEGACION: GrupoNav[] = [
  {
    titulo: 'Gestion',
    items: [
      { etiqueta: 'Socios', ruta: '/socios' },
      { etiqueta: 'Puestos', ruta: '/puestos' },
      { etiqueta: 'Giros', ruta: '/giros' },
      { etiqueta: 'Servicios', ruta: '/servicios' }
    ]
  },
  {
    titulo: 'Caja',
    items: [
      { etiqueta: 'Cuentas por cobrar', ruta: '/cuentas-cobrar' },
      { etiqueta: 'Cobranza', ruta: '/cobranza' },
      { etiqueta: 'Recibos', ruta: '/recibos' },
      { etiqueta: 'Bancos', ruta: '/bancos' }
    ]
  },
  {
    titulo: 'Administracion',
    items: [
      { etiqueta: 'Egresos', ruta: '/egresos' },
      { etiqueta: 'Comprobantes', ruta: '/comprobantes' },
      { etiqueta: 'Reportes', ruta: '/reportes' }
    ]
  },
  {
    titulo: 'Sistema',
    items: [
      { etiqueta: 'Usuarios', ruta: '/usuarios', soloAdmin: true },
      { etiqueta: 'Auditoria', ruta: '/auditoria', soloAdmin: true }
    ]
  }
];

@Component({
  selector: 'fg-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FgToasts],
  template: `
    <div class="shell" [class.shell--menu-abierto]="menuAbierto()">
      <aside class="shell__sidebar">
        <a class="marca" routerLink="/inicio">
          <img src="brand/logo.png" alt="Fantasmas Gestion" />
        </a>

        <nav class="nav">
          <a
            class="nav__item"
            routerLink="/inicio"
            routerLinkActive="is-activo"
            (click)="cerrarMenu()"
          >
            Inicio
          </a>
          @for (grupo of grupos(); track grupo.titulo) {
            <p class="nav__titulo">{{ grupo.titulo }}</p>
            @for (item of grupo.items; track item.ruta) {
              <a
                class="nav__item"
                [routerLink]="item.ruta"
                routerLinkActive="is-activo"
                (click)="cerrarMenu()"
              >
                {{ item.etiqueta }}
              </a>
            }
          }
        </nav>

        <div class="usuario">
          <span class="usuario__avatar">{{ iniciales() }}</span>
          <div>
            <strong>{{ auth.nombreCompleto() }}</strong>
            <span class="usuario__rol">{{ auth.sesion()?.rol }}</span>
          </div>
        </div>
      </aside>

      <div class="shell__main">
        <header class="topbar">
          <button
            type="button"
            class="fg-btn fg-btn--ghost fg-btn--sm topbar__menu"
            (click)="alternarMenu()"
          >
            Menu
          </button>
          <span class="fg-spacer"></span>
          <span class="fg-caption">{{ auth.sesion()?.usuario }}</span>
          <button type="button" class="fg-btn fg-btn--secondary fg-btn--sm" (click)="salir()">
            Cerrar sesion
          </button>
        </header>

        <main class="contenido">
          <router-outlet />
        </main>
      </div>

      <div class="shell__backdrop" (click)="cerrarMenu()"></div>
    </div>

    <fg-toasts />
  `,
  styles: [
    `
      .shell {
        display: flex;
        min-height: 100dvh;
        background: var(--fg-bg-app);
      }
      .shell__sidebar {
        width: 256px;
        flex: 0 0 256px;
        background: var(--fg-brand-900);
        color: var(--fg-neutral-200);
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 0;
        height: 100dvh;
        z-index: var(--fg-z-sidebar);
      }
      .marca {
        display: block;
        padding: var(--fg-space-4);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .marca img {
        display: block;
        width: 100%;
        max-width: 200px;
        height: auto;
        border-radius: var(--fg-radius-sm);
      }
      .nav {
        flex: 1;
        overflow-y: auto;
        padding: var(--fg-space-3) var(--fg-space-2);
      }
      .nav__titulo {
        font: 500 11px/16px var(--fg-font-family);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.45);
        padding: var(--fg-space-4) var(--fg-space-3) var(--fg-space-1);
      }
      .nav__item {
        display: block;
        padding: 9px var(--fg-space-3);
        border-radius: var(--fg-radius-sm);
        color: rgba(255, 255, 255, 0.82);
        font-size: 14px;
        border-left: 3px solid transparent;
      }
      .nav__item:hover {
        background: rgba(255, 255, 255, 0.06);
        text-decoration: none;
      }
      .nav__item.is-activo {
        background: rgba(255, 255, 255, 0.1);
        border-left-color: var(--fg-brand-500);
        color: var(--fg-white);
      }
      .usuario {
        display: flex;
        align-items: center;
        gap: var(--fg-space-3);
        padding: var(--fg-space-4);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 13px;
      }
      .usuario div {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .usuario strong {
        color: var(--fg-white);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .usuario__rol {
        color: rgba(255, 255, 255, 0.55);
        font-size: 12px;
      }
      .usuario__avatar {
        width: 36px;
        height: 36px;
        flex: 0 0 36px;
        border-radius: 50%;
        background: var(--fg-brand-500);
        color: var(--fg-white);
        display: grid;
        place-items: center;
        font-weight: 600;
      }
      .shell__main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .topbar {
        height: 64px;
        display: flex;
        align-items: center;
        gap: var(--fg-space-3);
        padding: 0 var(--fg-space-8);
        background: var(--fg-white);
        border-bottom: 1px solid var(--fg-border-soft);
        position: sticky;
        top: 0;
        z-index: var(--fg-z-sticky);
      }
      .topbar__menu {
        display: none;
      }
      .contenido {
        padding: var(--fg-space-8);
      }
      .shell__backdrop {
        display: none;
      }

      @media (max-width: 1023px) {
        .shell__sidebar {
          position: fixed;
          left: 0;
          top: 0;
          transform: translateX(-100%);
          transition: transform var(--fg-motion-normal);
        }
        .shell--menu-abierto .shell__sidebar {
          transform: translateX(0);
        }
        .shell--menu-abierto .shell__backdrop {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(16, 24, 40, 0.4);
          z-index: var(--fg-z-overlay);
        }
        .shell--menu-abierto .shell__sidebar {
          z-index: calc(var(--fg-z-overlay) + 1);
        }
        .topbar__menu {
          display: inline-flex;
        }
        .topbar {
          padding: 0 var(--fg-space-6);
        }
        .contenido {
          padding: var(--fg-space-6);
        }
      }
      @media (max-width: 767px) {
        .contenido {
          padding: var(--fg-space-4);
        }
      }
    `
  ]
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly menuAbierto = signal(false);

  protected readonly grupos = computed(() =>
    NAVEGACION.map((grupo) => ({
      ...grupo,
      items: grupo.items.filter((item) => !item.soloAdmin || this.auth.esAdmin())
    })).filter((grupo) => grupo.items.length > 0)
  );

  protected readonly iniciales = computed(() => {
    const sesion = this.auth.sesion();
    if (!sesion) return '?';
    return `${sesion.nombres.charAt(0)}${sesion.apellidos.charAt(0)}`.toUpperCase();
  });

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected salir(): void {
    this.auth.logout();
  }
}
