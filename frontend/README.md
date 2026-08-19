# Fantasmas Gestión — Frontend Angular

Frontend del Sistema de Gestión Administrativa y de Caja de la galería comercial. Consume el backend Spring Boot de este mismo repositorio (`../src`), endpoint por endpoint.

- **Angular 20** (standalone components, signals, control flow `@if`/`@for`), TypeScript, SCSS.
- **Sin dependencias adicionales**: nada de Material, lucide, chart.js ni date-fns. Los iconos son SVG y los formatos usan `Intl`.
- Estilos basados en los tokens de `../DesignSistem.md` (paleta, tipografía Inter, espaciado, radios, sombras).

## Requisitos previos

1. **MySQL** con la base creada: `CREATE DATABASE bd_galeria_comercial;`
2. **Backend corriendo en `http://localhost:8080`** (necesita JDK 21):
   ```powershell
   $env:JAVA_HOME = "C:\Users\GamingWorld\.jdks\ms-21.0.11"
   cd ..
   .\mvnw.cmd spring-boot:run
   ```
   En el primer arranque el `DataInitializer` crea `admin / Admin123!` (ADMIN) y `operador / Operador123!` (OPERADOR).
3. **Node 20.19+ o 22.12+** (probado con Node 22.17).

## Ejecutar

```bash
npm install      # solo la primera vez
npm start        # http://localhost:4200
npm run build    # compilación de producción en dist/
npm test         # pruebas unitarias (Karma)
```

La URL del backend está en `src/environments/environment.ts`. No hace falta proxy: el backend ya publica CORS abierto.

## Estructura

```txt
src/
├── app/
│   ├── core/
│   │   ├── api/          un servicio por controlador del backend
│   │   ├── auth/         AuthService, guards (auth / admin / invitado)
│   │   ├── http/         interceptores de Bearer y de errores
│   │   ├── layout/       shell (sidebar + topbar)
│   │   ├── ui/           ToastService
│   │   ├── util/         formatos, descarga de blobs, errores de formulario
│   │   └── models.ts     interfaces espejo de los DTO del backend
│   ├── shared/ui/        fg-table, fg-modal, fg-field, fg-chip, fg-confirm,
│   │                     fg-page-header, fg-toasts, pipes
│   ├── features/         una carpeta por módulo funcional
│   └── app.routes.ts
├── styles/               _tokens.scss, _base.scss
└── public/brand/         logo.png, isotipo.svg (placeholder), placeholder.svg
```

## Pantallas y endpoints

| Ruta | Endpoints que consume | RF |
|---|---|---|
| `/login` | `POST /usuarios/login` | RF-01, RF-02 |
| `/inicio` | `GET /cuentas-cobrar`, `GET /recibos/ingresos?fecha=` | — |
| `/socios`, `/socios/:id` | `/socios` CRUD + `/buscar`, `/puestos`, `/cuentas-cobrar/socio/{id}`, `/recibos/socio/{id}` | RF-05 a RF-07, RF-19, RF-26 |
| `/puestos`, `/puestos/:id` | `/puestos` CRUD + `/buscar`, `/cuentas-cobrar/puesto/{id}`, `/recibos/puesto/{id}` | RF-08 a RF-10 |
| `/giros` | `/giros` CRUD | RF-11, RF-12 |
| `/bancos` | `/bancos` CRUD | RF-12 |
| `/servicios` | `/servicios` CRUD + `/activos` + `PATCH /{id}/estado` | RF-13 a RF-15 |
| `/cuentas-cobrar` | listados + `generar/puestos`, `generar/consumo`, `generar/socios`, `abonar`, `exonerar`, `DELETE` | RF-16 a RF-21, RN-05, RN-06 |
| `/cobranza` | `/cuentas-cobrar/socio\|puesto/{id}`, `POST /recibos/pagos` | RF-21 a RF-23 |
| `/recibos` | `GET /recibos`, `/ingresos?fecha=`, `/bancarios?fecha=` | RF-26, RF-29, RF-31 |
| `/recibos/canje` | `POST /recibos/canjes` | RF-24 |
| `/recibos/ingreso-externo` | `POST /recibos/ingresos-externos` | RF-25 |
| `/egresos` | `/egresos` CRUD + `/por-fecha` + `/por-categoria` | RF-27, RF-28, RF-30 |
| `/comprobantes` | `/comprobantes-egreso` + `/por-mes` + `anular` + `procesar` | RF-28, RF-30 |
| `/reportes` | los 7 `GET /reportes/*` (XLSX) | RF-32, RF-33 |
| `/usuarios` *(ADMIN)* | `/usuarios` CRUD | RF-03 |
| `/auditoria` *(ADMIN)* | `/auditoria` + `/entidad/{e}` + `/usuario/{id}` | RNF-14 |

## Decisiones que vienen del backend

- **El `usuarioId` viaja explícito.** El principal autenticado es solo el username, así que pagos, canjes, ingresos externos, anulación de cuentas, borrado de egresos y anular/procesar comprobantes lo toman de `AuthService.usuarioId()`.
- **Paginación, orden y filtros son en cliente**: ningún endpoint pagina. La búsqueda contra servidor existe solo para socios (`/socios/buscar?texto=`) y puestos (`/puestos/buscar?numero=`), con debounce de 300 ms.
- **Estados literales**: `PENDIENTE / ABONADA / EXONERADA`, `INGRESO / BANCO / EGRESO`, `FIJO / CONSUMO`, `SOCIO / PUESTO`. No se derivan estados que el backend no tenga (no hay "vencido").
- **Roles**: con `OPERADOR` se ocultan las acciones de escritura de catálogos y los menús Usuarios y Auditoría. La autorización real la hace el backend (403).
- **Reportes**: se descargan como `blob` y el nombre del archivo lo arma el front, porque `Content-Disposition` no está en `exposedHeaders` de la config CORS.
- **Sesión de 1 hora sin refresh token**: al vencer, el interceptor cierra sesión y redirige al login.

## Fuera de alcance (el backend no lo soporta)

PDF e impresión de recibos, anulación de recibos, estados "vencido"/"en proceso", reporte de morosidad, gráficos, notificaciones, modo oscuro y el detalle de qué cuentas salda cada recibo (no existe tabla de unión recibo↔cuenta).

## Assets

- `public/brand/logo.png` — logo original (1.6 MB, fondo oscuro). Se usa sobre superficies oscuras: panel del login y cabecera del sidebar. **Pendiente**: exportar una versión optimizada y con fondo transparente.
- `public/brand/isotipo.svg` — **placeholder** de Fanti para favicon y página 404.
- `public/brand/placeholder.svg` — **placeholder** genérico para ilustraciones futuras.
