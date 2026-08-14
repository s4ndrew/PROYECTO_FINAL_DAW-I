# Backend — Sistema de Gestión Administrativa y de Caja (Galería Comercial)

Este documento explica qué se generó en esta pasada, cómo se compara contra la especificación de requisitos (`Documento_Requisitos_Sistema_Gestion.pdf`) y cómo probar cada módulo en Postman. Está pensado para que cualquiera del equipo (o el profesor) pueda levantar el proyecto y validar cada requisito funcional (RF), regla de negocio (RN) y requisito no funcional (RNF) sin tener que leer el código primero.

## 1. Antes de correr el proyecto

1. **Base de datos**: crea la base vacía en MySQL. El nombre debe calzar con `application.properties`:
   ```sql
   CREATE DATABASE bd_galeria_comercial;
   ```
   Con `spring.jpa.hibernate.ddl-auto=update`, Hibernate crea/actualiza las tablas solo a partir de las clases `@Entity` — no hay que correr ningún script `.sql` a mano.
2. **Build**: este entorno de análisis no tuvo Maven ni red disponibles para compilar, así que **la primera vez, dale Build/Run en IntelliJ y revisa la consola** antes de asumir que todo compila. El repaso de este documento fue manual (lectura de cada archivo), no una compilación real.
3. **Dependencias nuevas** en `pom.xml`: Apache POI (reportes XLSX) y JJWT `0.12.6` (`jjwt-api`, `jjwt-impl`, `jjwt-gson`) para el login. Si Maven no encuentra esa versión exacta de JJWT, ajústala a la más reciente 0.12.x disponible.
4. **Primer arranque**: como ahora *todas* las rutas exigen JWT salvo el login, un `DataInitializer` crea automáticamente dos usuarios la primera vez que la tabla `usuarios` está vacía:
   - Administrador: usuario `admin` / password `Admin123!`
   - Operador de caja: usuario `operador` / password `Operador123!`
   Verás los logs correspondientes en la consola. Con estos dos puedes probar directamente el control de acceso por rol (sección 2.1) sin tener que crear usuarios a mano primero.
5. **Puerto**: no hay `server.port` en `application.properties`, así que corre en `http://localhost:8080`.

## 2. Autenticación (todas las rutas, salvo login)

Después de este cambio, **cada request a la API (menos `POST /usuarios/login`) necesita el header**:
```
Authorization: Bearer <token>
```
El token se obtiene del login y expira en 1 hora (configurable en `jwt.expiration-ms`). Si antes probaste los catálogos sin login (como hicimos las sesiones pasadas), a partir de ahora esas mismas pruebas van a devolver `401`/`403` si no mandas el header.

### RF-01 / RF-02 / RF-04 — Login, sesión, logout

| Acción | Método | URL | Body |
|---|---|---|---|
| Login | `POST` | `/usuarios/login` | `{ "usuario": "admin", "password": "Admin123!" }` |

Respuesta esperada (200):
```json
{
  "token": "eyJhbGciOi...",
  "id": 1,
  "usuario": "admin",
  "nombres": "Administrador",
  "apellidos": "Sistema",
  "rol": "ADMIN"
}
```
Copia el `token` y en Postman configúralo en la pestaña **Authorization → Bearer Token** (o crea una variable de entorno `{{token}}` y úsala en cada request). Con credenciales inválidas (usuario que no existe, password incorrecto o usuario inactivo) responde **`401 Unauthorized`** con un mensaje claro (`CredencialesInvalidasException`, ver `GlobalExceptionHandler`).

"Cerrar sesión" (RF-04) es responsabilidad del frontend: como el JWT es *stateless*, no hay nada que invalidar en el backend — Angular simplemente borra el token guardado. Eso es estándar en este patrón (ver guía de estilo, sección 3.8).

### 2.1 Control de acceso por rol (RNF-02)

El JWT lleva el `rol` del usuario como claim, y `JwtAuthFilter` lo traduce en una authority `ROLE_ADMIN` / `ROLE_OPERADOR` de Spring Security. Cada controlador restringe sus operaciones de escritura con `@PreAuthorize("hasRole('ADMIN')")` según el actor responsable descrito en las especificaciones:

| Módulo | Consulta (GET) | Escritura (POST/PUT/PATCH/DELETE) |
|---|---|---|
| Socios, Giros, Puestos, Bancos, Servicios | Cualquier usuario autenticado (ADMIN u OPERADOR) | Solo **ADMIN** |
| Usuarios (`/usuarios`) | Solo **ADMIN** | Solo **ADMIN** |
| Cuentas por cobrar, Recibos/Cobranza, Egresos, Comprobantes, Reportes | Cualquier usuario autenticado | Cualquier usuario autenticado (ambos actores operan cobranza/egresos por especificación) |
| Auditoría (`/auditoria`) | Solo **ADMIN** | — (solo lectura) |

Razón: la especificación dice que el Administrador "gestiona catálogos de socios, puestos, giros, servicios y bancos", mientras que el Operador de caja "consulta deudas, registra pagos, ingresos, egresos y descarga reportes" — por eso el catálogo se puede *leer* desde cualquier rol (el operador necesita buscar un socio/puesto para cobrar) pero solo el administrador lo *modifica*.

Para probarlo en Postman: loguéate como `operador` e intenta un `POST /socios` — debe responder **403 Forbidden** ("No tiene permisos para realizar esta acción"). Con `admin` sí funciona.

### Gestión de usuarios (`/usuarios`)

| Acción | Método | URL | Notas |
|---|---|---|---|
| Listar | `GET` | `/usuarios` | El `password` nunca se devuelve (viene `null`) |
| Buscar por id | `GET` | `/usuarios/{id}` | 404 si no existe |
| Crear | `POST` | `/usuarios` | `password` obligatorio, se cifra con BCrypt |
| Editar | `PUT` | `/usuarios/{id}` | `password` opcional: si no lo mandas, conserva el actual |
| Eliminar | `DELETE` | `/usuarios/{id}` | |

JSON de ejemplo para crear un operador de caja:
```json
{
  "usuario": "jchavez",
  "password": "Operador123",
  "nombres": "Jeremy",
  "apellidos": "Calderón",
  "rol": "OPERADOR",
  "activo": true
}
```

## 3. Catálogos — RF-05 a RF-12

Sin cambios de fondo respecto a lo ya probado en sesiones anteriores (Socio, Giro, Puesto, Banco), salvo que ahora **necesitan el Bearer token** y que crear/editar/eliminar es exclusivo del rol **ADMIN** (sección 2.1). Resumen de rutas:

| Recurso | Base URL | Verbos |
|---|---|---|
| Socios | `/socios` | GET, GET/{id}, GET/buscar?texto=, POST, PUT/{id}, DELETE/{id} |
| Giros | `/giros` | GET, GET/{id}, POST, PUT/{id}, DELETE/{id} |
| Puestos | `/puestos` | GET, GET/{id}, GET/buscar?numero=, POST, PUT/{id}, DELETE/{id} |
| Bancos | `/bancos` | GET, GET/{id}, POST, PUT/{id}, DELETE/{id} |

### Búsqueda en listas extensas (RNF-07)

Socios y Puestos son los catálogos que en una galería comercial real crecen mucho (decenas o cientos de registros), así que tienen un endpoint de búsqueda de texto además del listado completo:

- `GET /socios/buscar?texto=garcia` — busca por coincidencia parcial (sin distinguir mayúsculas) en código, nombre o apellidos.
- `GET /puestos/buscar?numero=M-1` — busca por coincidencia parcial en el número de puesto.

Ambos usan consultas derivadas de Spring Data (`findBy...ContainingIgnoreCase`) con índice de BD de soporte (ver sección 8, RNF-09).

`Puesto` recibe `giroId` (obligatorio) y `socioId` (opcional, "cuando corresponda" — RF-10) en vez de los objetos completos:
```json
{
  "numero": "M-101",
  "giroId": 1,
  "socioId": 3,
  "inquilinoNombre": "Comercial ABC SAC",
  "inquilinoDocumento": "20123456789",
  "vigenciaInicio": "2026-01-01",
  "vigenciaFin": "2026-12-31"
}
```

## 4. Servicios y cuentas por cobrar — RF-13 a RF-18, RN-01, RN-02, RN-05, RN-06

### 4.1 Servicios (`/servicios`)

| Acción | Método | URL |
|---|---|---|
| Listar todos | `GET` | `/servicios` |
| Listar activos | `GET` | `/servicios/activos` |
| Buscar por id | `GET` | `/servicios/{id}` |
| Crear | `POST` | `/servicios` |
| Editar | `PUT` | `/servicios/{id}` |
| Activar/desactivar | `PATCH` | `/servicios/{id}/estado?activo=true` |
| Eliminar | `DELETE` | `/servicios/{id}` |

Ejemplo — cuota de mantenimiento (costo fijo, se cobra al puesto):
```json
{
  "nombre": "Cuota de mantenimiento",
  "recurrencia": "MENSUAL",
  "moneda": "PEN",
  "costo": 120.00,
  "destinoCargo": "PUESTO",
  "tipoCosto": "FIJO"
}
```
Ejemplo — luz por consumo (`costoUnitario` ya se manda directo en el body; RN-05 lo multiplica por la diferencia de lecturas al generar la cuenta):
```json
{
  "nombre": "Luz por consumo",
  "recurrencia": "MENSUAL",
  "moneda": "PEN",
  "costo": 0,
  "destinoCargo": "PUESTO",
  "tipoCosto": "CONSUMO",
  "costoUnitario": 0.85
}
```

`destinoCargo` solo acepta `SOCIO` o `PUESTO` (RN-02); `tipoCosto` solo acepta `FIJO` o `CONSUMO` (RF-15). Mandar cualquier otro valor devuelve 400 con el mensaje de validación.

### 4.2 Cuentas por cobrar (`/cuentas-cobrar`)

| Acción | Método | URL | RF |
|---|---|---|---|
| Listar todas | `GET` | `/cuentas-cobrar` | |
| Buscar por id | `GET` | `/cuentas-cobrar/{id}` | |
| Por socio | `GET` | `/cuentas-cobrar/socio/{socioId}` | RF-19 |
| Por puesto | `GET` | `/cuentas-cobrar/puesto/{puestoId}` | RF-19 |
| Generar para puestos (costo fijo) | `POST` | `/cuentas-cobrar/generar/puestos` | RF-16 |
| Generar por consumo | `POST` | `/cuentas-cobrar/generar/consumo` | RF-17, RN-05 |
| Generar para socios | `POST` | `/cuentas-cobrar/generar/socios` | RF-18, RN-06 |
| Marcar abonada | `PATCH` | `/cuentas-cobrar/{id}/abonar` | RF-21 |
| Marcar exonerada | `PATCH` | `/cuentas-cobrar/{id}/exonerar` | RF-21 |
| Anular | `DELETE` | `/cuentas-cobrar/{id}?usuarioId=1` | (queda auditado, RNF-14) |

**Generar para puestos** (el servicio debe tener `tipoCosto: FIJO`):
```json
{
  "servicioId": 1,
  "periodo": "2026-08",
  "puestoIds": [1, 2, 3]
}
```
No duplica: si ya generaste esa cuenta para ese puesto/servicio/periodo, la vuelve a pedir y simplemente la salta.

**Generar por consumo** (el servicio debe tener `tipoCosto: CONSUMO`; el monto se calcula solo — RN-05):
```json
{
  "servicioId": 2,
  "puestoId": 1,
  "periodo": "2026-08",
  "lecturaInicial": 1200.5,
  "lecturaFinal": 1350.0
}
```
`monto = max(lecturaFinal - lecturaInicial, 0) * costoUnitario` — si el `costoUnitario` del servicio no se cargó (ver nota en 4.1), el monto sale en 0.

**Generar para socios** (filtra por etapa y puede deduplicar por nombre+apellido — RN-06):
```json
{
  "servicioId": 3,
  "periodo": "2026-08",
  "etapas": ["1", "2"],
  "soloUnicos": true
}
```

## 5. Cobranza e ingresos — RF-19 a RF-26, RN-03, RN-04

Todo vive en `/recibos`. El correlativo (RNF-05) se genera con una fila bloqueada por transacción (`ICorrelativoRepository` con `@Lock(PESSIMISTIC_WRITE)`), así que dos pagos simultáneos no pueden repetir número.

| Acción | Método | URL | RF |
|---|---|---|---|
| Listar todos | `GET` | `/recibos` | |
| Buscar por id | `GET` | `/recibos/{id}` | |
| Por socio | `GET` | `/recibos/socio/{socioId}` | RF-19/RF-26 |
| Por puesto | `GET` | `/recibos/puesto/{puestoId}` | RF-19/RF-26 |
| Ingresos por fecha | `GET` | `/recibos/ingresos?fecha=2026-08-13` | RF-29 |
| Bancarios por fecha | `GET` | `/recibos/bancarios?fecha=2026-08-13` | RF-31 |
| Procesar pago | `POST` | `/recibos/pagos` | RF-21/RF-22/RF-23 |
| Canje bancario | `POST` | `/recibos/canjes` | RF-24 |
| Ingreso externo | `POST` | `/recibos/ingresos-externos` | RF-25 |

**Procesar pago** — marca las cuentas indicadas como `ABONADA`, suma el total y emite un recibo con correlativo, todo en una sola transacción (RNF-04: si algo falla, no queda ni cuenta pagada sin recibo ni recibo sin cuenta):
```json
{
  "cuentaIds": [10, 11],
  "usuarioId": 1
}
```

**Canje bancario** — solo para cuentas de socio (no de puesto):
```json
{
  "cuentaId": 12,
  "bancoId": 1,
  "fechaDeposito": "2026-08-13",
  "usuarioId": 1
}
```

**Ingreso externo** — no requiere cuenta por cobrar:
```json
{
  "depositante": "Municipalidad de Lima",
  "categoria": "Subvención",
  "concepto": "Aporte campaña navideña",
  "monto": 500.00,
  "usuarioId": 1
}
```

## 6. Egresos, comprobantes y reportes — RF-27 a RF-33

Esta parte ya venía armada por Andrew (módulo de Egresos) y se mantuvo casi intacta; solo se conectó con `GlobalExceptionHandler` y se agregaron 5 reportes nuevos.

### 6.1 Egresos (`/egresos`) y comprobantes (`/comprobantes-egreso`)

CRUD de egresos, listado por fecha/categoría, y comprobantes con `anular`/`procesar`, tal como ya existía. Dos ajustes en esta pasada:

- `DELETE /egresos/{id}?usuarioId=1`, `PATCH /comprobantes-egreso/{id}/anular?usuarioId=1` y `PATCH /comprobantes-egreso/{id}/procesar?usuarioId=1` ahora piden el usuario que ejecuta la acción, para poder auditarla (RNF-14, sección 7).
- Cuando el `id` no existe, esos endpoints ya no caen al manejador genérico de 500: lanzan `NoSuchElementException`, que `GlobalExceptionHandler` mapea a **404** con el mensaje original ("Egreso no encontrado con id: X").

### 6.2 Reportes XLSX (`/reportes`) — RF-32 y RF-33

| Reporte | Método | URL | RF |
|---|---|---|---|
| Egresos por fecha | `GET` | `/reportes/egresos/por-fecha?fechaInicio=2026-08-01&fechaFin=2026-08-31` | RF-32 (ya existía) |
| Egresos por categoría | `GET` | `/reportes/egresos/por-categoria/{categoria}` | RF-32 (ya existía) |
| Recibos del día | `GET` | `/reportes/recibos/diario?fecha=2026-08-13` | RF-32 — **nuevo** |
| Recibos del mes | `GET` | `/reportes/recibos/mensual?anio=2026&mes=8` | RF-32 — **nuevo** |
| Socios | `GET` | `/reportes/socios` | RF-33 — **nuevo** |
| No socios | `GET` | `/reportes/no-socios` | RF-33 — **nuevo** |
| Bancos | `GET` | `/reportes/bancos` | RF-33 — **nuevo** |

En Postman, estos endpoints devuelven un archivo binario: usa "Send and Download" (no "Send") para que Postman te deje guardar el `.xlsx` en vez de mostrarte texto ilegible.

**Sobre "no socios" (RF-33):** el enunciado no define qué significa exactamente. Lo interpreté como los **ingresos externos** (RF-25: dinero que entra sin estar ligado a un socio ni a un puesto, por ejemplo donaciones o aportes de terceros) — es la única categoría de "dinero de alguien que no es socio" que existe en el modelo. Si tu profesor tenía otra idea en mente (por ejemplo, inquilinos que no son propietarios), avísame y lo ajusto — es un cambio de una consulta, no de diseño.

## 7. Auditoría (RNF-14)

Todas las operaciones sensibles (pagos, canjes bancarios, ingresos externos, anulación de cuentas por cobrar, registro/eliminación de egresos, anulación/procesamiento de comprobantes) quedan registradas en una tabla `auditoria` (`AuditoriaEntity`), sin reemplazar el `usuarioId` que ya guardan Recibo/Egreso — es el log centralizado adicional para poder responder "quién hizo qué y cuándo" desde un solo lugar.

| Acción | Método | URL | Notas |
|---|---|---|---|
| Listar todo | `GET` | `/auditoria` | Solo ADMIN |
| Por entidad | `GET` | `/auditoria/entidad/{entidad}` | Ej: `CuentaCobrar`, `Recibo`, `Egreso`, `ComprobanteEgreso` |
| Por usuario | `GET` | `/auditoria/usuario/{usuarioId}` | |

Cada registro guarda: usuario (con nombre resuelto), fecha, entidad afectada, id de esa entidad, acción (`PAGO`, `CANJE`, `INGRESO_EXTERNO`, `ANULACION`, `REGISTRO`, `PROCESADO`) y un detalle en texto libre. Para verlo en acción: procesa un pago en `/recibos/pagos` y luego consulta `GET /auditoria/entidad/Recibo` — debe aparecer la fila con el usuario que lo procesó.

## 8. Qué se corrigio

Por transparencia, esto es lo que estaba roto y cómo quedó:

- **`CuentaCobrarEntity` no coincidía en nada con el modelo `CuentaCobrar`** (`idCuentaCobrar` vs `id`, `importe` vs `monto`, sin `puesto` ni `periodo` ni lecturas). Se reescribió la entidad para calzar 1 a 1 con el modelo.
- **`ReciboService`/`IReciboService` importaban `java.awt.print.Pageable`** en vez de la de Spring Data. Se quitó ese import y se reemplazaron los métodos stub por los reales de cobranza.
- **`ServicioService.actualizar()` no fijaba el `id` antes de `save()`**, así que un PUT insertaba una fila nueva en vez de actualizar. Corregido.
- **`ServicioService.listarActivos()` era una copia de `listarTodos()`** (no filtraba). Corregido con `.filter(ServicioEntity::isEstado)`.
- **`UsuarioEntity` no tenía campo `password`**, así que el login (RF-01) era imposible de implementar. Se agregó, cifrado con `BCryptPasswordEncoder`, y nunca se devuelve en las respuestas de la API.
- Typo `elimar` → `eliminar` en `IUsuarioService`.

## 9. Limitaciones conocidas / próximos pasos

- **No se pudo compilar en este entorno** (sin Maven ni red). Todo el repaso fue lectura manual, línea por línea, comparando interfaz ↔ implementación ↔ controller, en las dos pasadas de trabajo. Dale Build en IntelliJ antes de dar esto por bueno — en particular revisa que `@EnableMethodSecurity` y los `@PreAuthorize` nuevos no choquen con alguna versión distinta de Spring Security a la que se asumió aquí (6.x, la que trae `spring-boot-starter-security` en este `pom.xml`).
- **RNF-09 (rendimiento, "recuperar información en menos de 3 segundos")** se abordó agregando índices de BD (`@Index`) sobre las columnas que más se filtran (nombre/apellidos de socio, número de puesto, estado/periodo de cuentas por cobrar, tipo/fecha de recibos, fecha/categoría de egresos). No se hizo una prueba de carga real — sigue siendo responsabilidad del equipo medirlo con datos de producción o un dataset grande antes de la sustentación.
- **RN-07 ("los reportes se solicitan por fecha diaria o por mes según su tipo")** ya se cumple para los reportes que son intrínsecamente transaccionales/con fecha (egresos, recibos). Los reportes de `/reportes/socios` y `/reportes/bancos` son listados completos del catálogo (no tienen una fecha de negocio propia — un socio no "ocurre" en una fecha), así que se dejaron como snapshot completo; si tu profesor los quiere acotados a un rango de alta/baja, es un filtro adicional sobre `SocioEntity`/`BancoEntity` que no existe todavía en el modelo actual.
- **La interpretación de "no socios" (RF-33) sigue siendo los ingresos externos** (ver sección 6.2) — no cambió en esta pasada.

## 10. Checklist contra la guía de estilo del profesor

- [x] Password cifrado con `BCryptPasswordEncoder`.
- [x] Login devuelve JWT; rutas protegidas exigen `Authorization: Bearer`; credenciales inválidas devuelven 401.
- [x] Control de acceso por rol (`@PreAuthorize`, RNF-02) en catálogos y usuarios.
- [x] Auditoría centralizada de operaciones sensibles (RNF-14).
- [x] Búsqueda en listas extensas (RNF-07) para Socios y Puestos.
- [x] Índices de BD sobre las columnas más consultadas (RNF-09).
- [x] CRUD completo persistiendo en MySQL (`ddl-auto=update`, nada en memoria).
- [x] Separación `models` (DTO validado) / `entities` (JPA) / `repositories` / `services` (`I*` + `implementation`) / `controllers`.
- [ ] Frontend Angular — fuera del alcance de este backend.
- [x] Errores manejados centralizadamente (`GlobalExceptionHandler`) con códigos HTTP específicos por tipo de error (400 validación, 401 login, 403 rol, 404 no encontrado, 409 integridad, 500 red de seguridad).
