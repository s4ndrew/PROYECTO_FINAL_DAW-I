import { Routes } from '@angular/router';

import { adminGuard, authGuard, invitadoGuard } from './core/auth/guards';
import { Shell } from './core/layout/shell';

const T = (titulo: string) => `${titulo} | Fantasmas Gestion`;

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [invitadoGuard],
    title: T('Iniciar sesion'),
    loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: '',
    component: Shell,
    canMatch: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: T('Inicio'),
        loadComponent: () => import('./features/inicio/inicio.page').then((m) => m.InicioPage)
      },

      // Gestion
      {
        path: 'socios',
        title: T('Socios'),
        loadComponent: () => import('./features/socios/socios.page').then((m) => m.SociosPage)
      },
      {
        path: 'socios/:id',
        title: T('Detalle de socio'),
        loadComponent: () =>
          import('./features/socios/socio-detalle.page').then((m) => m.SocioDetallePage)
      },
      {
        path: 'puestos',
        title: T('Puestos'),
        loadComponent: () => import('./features/puestos/puestos.page').then((m) => m.PuestosPage)
      },
      {
        path: 'puestos/:id',
        title: T('Detalle de puesto'),
        loadComponent: () =>
          import('./features/puestos/puesto-detalle.page').then((m) => m.PuestoDetallePage)
      },
      {
        path: 'giros',
        title: T('Giros'),
        loadComponent: () => import('./features/giros/giros.page').then((m) => m.GirosPage)
      },
      {
        path: 'servicios',
        title: T('Servicios'),
        loadComponent: () =>
          import('./features/servicios/servicios.page').then((m) => m.ServiciosPage)
      },

      // Caja
      {
        path: 'cuentas-cobrar',
        title: T('Cuentas por cobrar'),
        loadComponent: () =>
          import('./features/cuentas-cobrar/cuentas-cobrar.page').then((m) => m.CuentasCobrarPage)
      },
      {
        path: 'cobranza',
        title: T('Cobranza'),
        loadComponent: () => import('./features/cobranza/cobranza.page').then((m) => m.CobranzaPage)
      },
      {
        path: 'recibos',
        title: T('Recibos'),
        loadComponent: () => import('./features/recibos/recibos.page').then((m) => m.RecibosPage)
      },
      {
        path: 'recibos/canje',
        title: T('Canje bancario'),
        loadComponent: () => import('./features/recibos/canje.page').then((m) => m.CanjePage)
      },
      {
        path: 'recibos/ingreso-externo',
        title: T('Ingreso externo'),
        loadComponent: () =>
          import('./features/recibos/ingreso-externo.page').then((m) => m.IngresoExternoPage)
      },
      {
        path: 'bancos',
        title: T('Bancos'),
        loadComponent: () => import('./features/bancos/bancos.page').then((m) => m.BancosPage)
      },

      // Administracion
      {
        path: 'egresos',
        title: T('Egresos'),
        loadComponent: () => import('./features/egresos/egresos.page').then((m) => m.EgresosPage)
      },
      {
        path: 'comprobantes',
        title: T('Comprobantes de egreso'),
        loadComponent: () =>
          import('./features/comprobantes/comprobantes.page').then((m) => m.ComprobantesPage)
      },
      {
        path: 'reportes',
        title: T('Reportes'),
        loadComponent: () => import('./features/reportes/reportes.page').then((m) => m.ReportesPage)
      },

      // Sistema (solo ADMIN, igual que en el backend)
      {
        path: 'usuarios',
        canMatch: [adminGuard],
        title: T('Usuarios'),
        loadComponent: () => import('./features/usuarios/usuarios.page').then((m) => m.UsuariosPage)
      },
      {
        path: 'auditoria',
        canMatch: [adminGuard],
        title: T('Auditoria'),
        loadComponent: () =>
          import('./features/auditoria/auditoria.page').then((m) => m.AuditoriaPage)
      },

      {
        path: '**',
        title: T('Pagina no encontrada'),
        loadComponent: () =>
          import('./features/no-encontrada/no-encontrada.page').then((m) => m.NoEncontradaPage)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
