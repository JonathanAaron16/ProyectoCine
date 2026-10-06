# 🎬 Cine App — Sistema de gestión y venta de entradas

Trabajo Práctico 1 — Programación IV (A344).

Aplicación web para un cine: los clientes consultan la cartelera, eligen función y butacas, suman productos del Candy Bar, aplican cupones, pagan con crédito y reciben un comprobante en PDF con código QR. Los empleados validan entradas y retiros en la puerta, y el administrador gestiona todo el negocio desde un panel propio.

- **URL desplegada:** https://proyectocine-b1ec5.web.app
- **Repositorio:** https://github.com/JonathanAaron16/ProyectoCine

---

## 1. Tecnologías

| Tecnología | Uso |
|---|---|
| **Angular** (standalone components) | Frontend completo, sin NgModules |
| **Angular Signal Forms** (`@angular/forms/signals`) | Todos los formularios (login, registro, ABMs, reseñas) |
| **Supabase** | Base de datos Postgres, autenticación, Row Level Security, funciones SQL y Realtime |
| **qrcode** | Generación del código QR de cada compra |
| **jsPDF** | Comprobante de compra y reporte de facturación en PDF |
| **Chart.js** | Gráfico de facturación en el panel de reportes |
| **xlsx (SheetJS)** | Exportación del reporte a Excel |
| **Google Fonts** (Fraunces, Space Grotesk) | Tipografías, importadas desde `src/styles.css` como en el proyecto `guards` de la cursada |

> **Nota sobre dependencias externas:** `qrcode`, `jsPDF`, `Chart.js` y `xlsx` no son parte del material visto en clase. Se incorporaron porque la consigna exige explícitamente QR, PDF, gráficos y exportación a Excel, y no existe una alternativa nativa de Angular para ninguno de esos cuatro requerimientos.

---

## 2. Instalación y ejecución

```bash
npm install
```

Crear/completar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'URL_DE_TU_PROYECTO_SUPABASE',
  supabasePublishableKey: 'ANON_KEY_DE_TU_PROYECTO',
};
```

```bash
ng serve
```

**Configuración necesaria en Supabase** (panel → Authentication → Sign In / Providers → Email):
- Proveedor de Email: **habilitado**.
- "Confirm email": **deshabilitado**. Con el flujo actual, si estuviera activo, `signUp` no devuelve sesión y el insert del perfil en `usuarios` falla por RLS (`auth.uid()` es `null`), dejando un usuario en Auth sin perfil. No impide crear cuentas: es una condición del flujo. La alternativa correcta sería un trigger sobre `auth.users` que cree el perfil leyendo los datos de `options.data` de `signUp`; no se hizo porque no está en el material de clase y el límite de mails del plan gratuito puede fallar en una demo.
- **Realtime:** `schema.sql` ya activa la publicación de `entradas`. Si se usa una base existente, correr `alter publication supabase_realtime add table public.entradas;`.

**Despliegue (Firebase Hosting):**

```bash
ng build
firebase deploy --only hosting
```

`firebase.json` apunta a `dist/ProyectoCine/browser`, que es la salida de `ng build`, y redirige todas las rutas a `index.html` para que los enlaces directos de la aplicación (por ejemplo `/peliculas/3`) funcionen al recargar. La carpeta `public/` es solo la de assets de Angular (contiene el favicon): no se copian archivos compilados a mano.

---

## 3. Arquitectura

### 3.1 Estructura de carpetas

```
src/app/
├── componentes/        # Pantallas y piezas de UI (todas standalone)
│   ├── encabezado/  pie-pagina/  inicio/  login/  registro/
│   ├── peliculas/ (listado, detalle)
│   ├── compra/  proximamente/  mis-puntos/  mis-peliculas/  mis-compras/
│   ├── empleado/validar/
│   ├── admin/ (panel + ABMs: peliculas-form, salas, salas-form, funciones,
│   │           funciones-form, productos, productos-form, cupones, cupones-form,
│   │           recompensas, recompensas-form, reportes, log)
│   └── error/
├── servicios/          # Toda la comunicación con Supabase y el estado global
├── models/             # Interfaces TypeScript (una por entidad)
├── guards/             # Protección de rutas
├── app.ts / app.html / app.css
├── app.routes.ts       # Rutas con lazy loading
└── app.config.ts

src/styles.css          # Estilos globales: fuentes, variables, botones, tarjetas, tablas y panel de administración
```

### 3.2 Capas y flujo de datos

```
Componente  ──usa──▶  Servicio  ──consulta──▶  Supabase (Postgres + Auth + RLS)
    │                    │
    └── Signals ◀────────┘   (el estado vive en signals; el template se actualiza solo)
```

- **Componentes**: solo UI y lógica de presentación. Nunca hablan directo con Supabase (salvo casos muy puntuales de lectura simple).
- **Servicios**: una responsabilidad cada uno; encapsulan las consultas.
- **Models**: contrato de datos entre servicios y componentes.
- **Guards**: deciden si una ruta puede activarse o abandonarse.

### 3.3 Servicios

| Servicio | Responsabilidad | Por qué existe |
|---|---|---|
| `supabase-client` | Instancia **única** del cliente de Supabase | Evita múltiples clientes de auth peleando por el mismo `localStorage` |
| `auth` | signIn / signUp / signOut contra Supabase Auth | Aísla el login del resto de la app |
| `usuarios` | Crear y leer el perfil en la tabla `usuarios` | Separa "credenciales" (Auth) de "datos del perfil" (tabla propia) |
| `sesion` | Usuario actual como `signal`, helpers `esAdmin/esEmpleado/esCliente`, logout | Estado global reactivo; el header, los guards y las pantallas lo consultan sin repetir lógica |
| `peliculas` | CRUD de películas y sus géneros, destacadas, próximamente | Centraliza la consulta con géneros anidados |
| `resenas` | Leer/crear reseñas | |
| `salas` | Crear sala **generando sus butacas**, listar | La generación de butacas es regla de negocio, no de UI |
| `funciones` | Crear función con **asignación automática de sala** | Contiene el algoritmo de disponibilidad y buffer de 30 min |
| `compras` | Datos de la pantalla de compra, confirmación, cancelación, historial | Concentra la operación más crítica del sistema |
| `productos` | ABM de productos, categorías y combos | |
| `cupones` | ABM y validación de cupones | |
| `recompensas` | ABM, canje e historial | |
| `alertas` | Alertas de estreno por usuario | |
| `validacion` | Validación de entradas y retiro de productos | |
| `log-actividad` | Registro y consulta del log administrativo | |
| `reportes` | Consultas agregadas para el panel de reportes | |

### 3.4 Guards

| Guard | Tipo | Función |
|---|---|---|
| `admin-guard` | `CanActivateFn` | Bloquea `/admin/*` si el rol no es administrador. Espera a que la sesión termine de cargar para no rechazar por error al refrescar |
| `empleado-guard` | `CanActivateFn` | Permite `/empleado/validar` a empleados **y** administradores |
| `form-guard` | `CanDeactivateFn<Iform>` | Pregunta antes de abandonar un formulario con cambios sin guardar. Los formularios implementan la interfaz `Iform` (`noGuardado()`) |

Los guards de activación devuelven `router.createUrlTree([...])` en vez de llamar a `navigate()`: la redirección es parte del resultado del guard, sin efectos laterales sueltos.

### 3.5 Rutas

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | Inicio | Público |
| `/peliculas`, `/peliculas/:id` | Listado, Detalle | Público |
| `/proximamente` | Próximamente | Público (alertas: requiere sesión) |
| `/compra/:funcionId` | Compra | Público (anónimo permitido; en funciones +13/+18 se muestra el aviso de acompañante y un usuario registrado menor a la edad mínima no puede comprar) |
| `/login`, `/registro` | Login, Registro | Público |
| `/mis-puntos`, `/mis-peliculas`, `/mis-compras` | Pantallas del cliente | Cliente logueado |
| `/empleado/validar` | Validar | `empleado-guard` |
| `/admin` y `/admin/*` (películas, salas, funciones, productos, cupones, recompensas, reportes, log) | Panel de administración | `admin-guard` (+ `form-guard` en los formularios) |
| `**` | Error 404 | Público |

Todas las rutas usan `loadComponent` (lazy loading): cada pantalla se descarga recién cuando se visita.

### 3.6 Roles y permisos

| Rol | Puede |
|---|---|
| **Anónimo** | Ver cartelera y detalle, elegir butacas, comprar (en funciones +13/+18 ve un aviso: si es menor, debe asistir con un adulto), usar cupones generales |
| **Cliente** | Todo lo anterior + perfil, puntos, canjes, crédito, cupón de bienvenida, cancelar compras, reseñas, alertas, "Mis películas" |
| **Empleado** | Validar entradas y retiros por código |
| **Administrador** | Todo el panel + también validar |

---

## 4. Base de datos (Supabase)

### 4.1 Tablas

`usuarios`, `generos`, `peliculas`, `peliculas_generos` (N a N), `salas`, `butacas`, `funciones`, `resenas`, `compras`, `entradas`, `categorias_productos`, `productos`, `productos_combo`, `productos_comprados`, `cupones`, `cupones_usados`, `recompensas`, `canjes`, `alertas_estreno`, `log_actividad`.

### 4.2 Funciones SQL (operaciones atómicas)

| Función | Qué hace |
|---|---|
| `sumar_puntos(usuario, cantidad)` | Acredita puntos de una compra al usuario logueado |
| `canjear_recompensa(usuario, recompensa)` | Valida puntos, los descuenta y registra el canje, todo en una transacción |
| `cancelar_compra(compra, usuario)` | Valida titularidad y ventana de 2 hs (hora de Argentina), marca la compra y sus entradas como canceladas y acredita el importe como crédito |
| `usar_credito(usuario, monto)` | Descuenta crédito validando que alcance |
| `revertir_compra(compra, codigo_qr)` | Deshace una compra recién creada si falla un paso posterior; exige el QR de la compra, solo funciona durante unos minutos y si nada fue validado |
| `es_admin()` / `es_staff()` | Helpers de rol usados en las políticas de seguridad (`security definer`, evitan recursión de RLS) |

Las funciones de puntos, canjes, cancelación y crédito validan que el `usuario_id` recibido sea el usuario logueado (`auth.uid()`).

### 4.3 Seguridad (Row Level Security)

- **Catálogo** (películas, géneros, salas, butacas, funciones, productos, cupones, recompensas): lectura pública; escritura solo si `rol = 'administrador'`.
- **usuarios**: cada usuario crea/ve/edita solo su propia fila; el administrador puede leerlas todas (para mostrar nombres en el log). El alta exige `rol = 'cliente'`, `puntos = 0` y `credito = 0`, y un trigger impide que desde la API alguien se modifique `rol`, `puntos` o `credito` (solo lo hacen las funciones SQL y el administrador desde el panel de Supabase).
- **compras**: cualquiera puede crear una; ve las propias (los empleados ven cualquiera, para validar por código).
- **entradas / productos_comprados**: update solo para empleados y administradores.
- **log_actividad**: insertan empleados/administradores; solo el administrador lo consulta.

---

## 5. Reglas de negocio implementadas

| Regla de la consigna | Dónde se resuelve |
|---|---|
| Distribución de butacas (filas A-I, L-Q comunes; J accesible; R-S-T VIP) | `servicios/salas.ts` |
| Precio VIP superior y diferenciado visualmente | `compra.ts` (multiplicador ×1,5) + estilos del mapa |
| No dos funciones simultáneas en la misma sala + 30 min de buffer | `servicios/funciones.ts` |
| Asignación automática de sala | `servicios/funciones.ts` (`buscarSalaDisponible`) |
| Imposible vender dos veces la misma butaca | Índice único parcial `(funcionId, butacaId) where activa` en `entradas` |
| Butacas ocupadas visibles para otros usuarios, en tiempo real | Supabase Realtime sobre `entradas` (`servicios/compras.ts` + `compra.ts`) |
| Restricción de edad (+13 / +18) | `compra.ts`: un usuario registrado menor a la edad mínima no puede comprar; sin cuenta se avisa que debe asistir con un adulto |
| QR único por compra, usado también para el Candy Bar | `compras.codigoQr` (UUID) |
| Un QR no se puede reutilizar | `update ... where validada = false` (condicional) en `validacion.ts` |
| Registro de quién y cuándo validó | `empleadoValidadorId` / `fechaValidacion` (y equivalentes en productos) |
| Cupón de primera compra / mayores de 50 / generales, porcentaje configurable | `servicios/cupones.ts` + ABM de admin |
| 1 punto por peso gastado, recompensas configurables, historial de canjes | `sumar_puntos`, `canjear_recompensa`, `/mis-puntos` |
| Preventa: desde 7 días antes del estreno, precio especial, luego vuelve al normal | `compra.ts` (`estaEnPreventa`) + campo `precioPreventa` por película |
| Cancelación hasta 2 hs antes, sin devolución, importe → crédito | `cancelar_compra` + `/mis-compras` (la butaca vuelve a estar disponible) |
| Crédito usable en compras futuras | `usar_credito` + opción en la pantalla de compra |
| Reseñas con estrellas y promedio | `detalle` + `servicios/resenas.ts` |
| Reportes (facturación diaria, entradas, más vistas, producto top) + gráfico + PDF + Excel | `componentes/admin/reportes` |
| Log de actividad (crear función, cambiar precio, validar QR) | `servicios/log-actividad.ts` + `/admin/log` |

---

## 6. Decisiones técnicas

**1. Componentes standalone con lazy loading.** Es el esquema por defecto de Angular moderno y el que usan los proyectos vistos en clase (`app.config.ts`, sin `app.module.ts`). Cada componente declara sus propias dependencias y se carga bajo demanda con `loadComponent`, sin armar un módulo por pantalla.

**2. Signal Forms.** Es el enfoque de formularios usado en el proyecto de ejemplo `ejemploSupabase` de la cursada (estable desde Angular 22). Se mantuvo en todo el proyecto por consistencia. Los validadores (`required`, `email`, `minLength`, `pattern`, `min`, `max`) son los propios de `@angular/forms/signals`.

**3. Un único cliente de Supabase** (`supabase-client.ts`). Con un cliente por servicio, Supabase advertía "Multiple GoTrueClient instances" y podía producir comportamiento indefinido en la sesión.

**4. Columnas en `camelCase` entre comillas.** Los nombres de columnas coinciden exactamente con las propiedades de los modelos TypeScript, por lo que los objetos se insertan y se leen sin una capa de traducción `snake_case ⇄ camelCase`. Es el mismo estilo directo (`insert([objeto])`) del servicio `Cosas` del proyecto de clase. Costo: en SQL manual hay que escribir las columnas entre comillas.

**5. Estado de sesión reactivo (`Sesion`).** Un `signal` con el usuario actual, sincronizado con `onAuthStateChange`. Así el header, los guards y las pantallas consultan el rol sin pedirlo a Supabase cada vez.

**6. Guards funcionales y `createUrlTree`.** Misma convención que el proyecto `guards` de la cursada. Se agregó la espera a `sesion.cargando()` para evitar rechazos falsos al refrescar la página dentro de una ruta protegida.

**7. La integridad la garantiza la base, no el cliente.** La prevención de doble venta es un índice único parcial en Postgres sobre `(funcionId, butacaId)` para las entradas activas: aunque dos personas confirmen la misma butaca en el mismo instante, el segundo insert falla y la compra se deshace (`revertir_compra`). Al cancelar una compra, sus entradas pasan a `activa = false`: la butaca vuelve a estar disponible sin perder el historial. La interfaz solo mejora la experiencia.

**8. Operaciones críticas como funciones SQL.** Puntos, canjes, cancelación y uso de crédito se hacen en una sola transacción dentro de Postgres (con `for update` donde corresponde). La alternativa "leer en el cliente → calcular → escribir" tiene una condición de carrera real: dos operaciones simultáneas leen el mismo saldo y una pisa a la otra. Además, todas están atadas al usuario logueado (`auth.uid()`): una llamada directa a la API no puede operar sobre la cuenta de otra persona.

**9. Supabase Realtime para las butacas ocupadas.** La pantalla de compra se suscribe a los cambios de `entradas` con el mismo patrón de la carpeta `supabaseRealTime` de la cursada: un `Observable` que carga la lista inicial, escucha `postgres_changes` sin filtro, vuelve a consultar ante cada cambio y cierra el canal al desuscribirse; el componente guarda la `Subscription` y la cancela en `ngOnDestroy` (y al confirmar la compra, para que el evento de la propia compra no altere la selección). Antes se había probado con polling (`setInterval`), que se descartó. La consulta de ocupadas filtra por `entradas.activa = true` y no por `compras.estado`: ese join fallaba por RLS (cada usuario solo ve sus compras) y mostraba butacas ocupadas distintas según quién mirara.

**10. Butacas posicionadas por columna.** Cada butaca se guarda con su número según su posición horizontal real (con huecos en los pasillos), y el mapa se dibuja con una grilla de 30 columnas. Los pasillos aparecen solos, sin calcular márgenes a mano, y la fila accesible queda alineada bajo los sectores de las demás filas.

**11. Asignación automática de sala.** Al crear una función se recorren las salas y se elige la primera cuyo horario no se superponga con ninguna función existente ese día (considerando duración de película + 30 minutos de margen de cada lado). Se guarda `horaFin` para no recalcularla en cada pantalla.

**12. Un QR por compra, validación por ítem.** El código identifica la compra completa (entradas y Candy Bar). El empleado valida cada entrada y cada producto por separado, y el `update` condicional (`where validada = false`) garantiza que un ítem no pueda validarse dos veces ni siquiera con dos empleados a la vez.

**13. Compra anónima y restricción de edad.** La consigna permite comprar sin cuenta y pide impedir que un menor compre una película restringida. La edad mínima sale de la clasificación (+13 → 13, +18 → 18). Un usuario registrado menor a esa edad no puede comprar; un usuario sin cuenta sí, pero ve la leyenda de que, si es menor, debe asistir acompañado por un adulto (también en la pantalla de confirmación y en el PDF). Límite: un menor con cuenta puede cerrar sesión y comprar como anónimo, por eso para anónimos es un aviso y no un control.

**14. Reseñas verificadas.** Solo puede reseñar una película quien compró una entrada para ella. No lo exige textualmente la consigna, pero evita reseñas de quien nunca la vio. _(Valida la compra, no la asistencia efectiva.)_

**15. Preventa calculada por fecha.** No hay un proceso que "abra" o "cierre" la preventa: el precio efectivo se decide al comprar según la fecha de hoy y la de estreno (`hoy ∈ [estreno − 7 días, estreno)`). Después del estreno vuelve solo al precio normal de la función.

**16. Reportes agregados en el cliente.** Se traen las filas del rango pedido y se agrupan con `Map` / `reduce` / `sort`, evitando sumar funciones de agregación SQL al final del proyecto. El rango de fechas es libre (desde / hasta), de modo que cubre "por semana" y "por mes" con un solo control.

**17. Log de actividad dentro de los servicios.** El registro se dispara desde los servicios que ejecutan la acción (crear función, cambiar precio, validar QR), no desde los componentes, para que ninguna pantalla pueda "olvidarse" de registrar.

**18. Seguridad: el cliente nunca es de confianza.** Como la app habla directo con Supabase y la anon key es pública, cualquiera puede llamar a la API sin pasar por las pantallas. Por eso el alta de usuario solo acepta `rol = 'cliente'` con puntos y crédito en cero, un trigger impide que alguien se cambie `rol`, `puntos` o `credito`, y las funciones SQL validan que el `usuario_id` recibido sea el logueado. Las políticas usan los helpers `es_admin()` / `es_staff()` (`security definer`) para evitar recursión de RLS.

**19. Estilos globales sin librerías.** `src/styles.css` define las fuentes (Fraunces y Space Grotesk, las mismas del proyecto `guards`), variables de color en `:root` y reglas compartidas (botones por clase, tarjetas, formularios, tablas y panel de administración); cada componente conserva su propio CSS para lo específico. Los botones no se estilan con un `button { ... }` global porque las butacas del mapa son botones de 22 px y heredarían el padding y la sombra.

**20. `@Injectable` en lugar de `@Service`.** El material de clase usa `@Service()` (Angular 22), que equivale a `@Injectable({ providedIn: 'root' })`. El proyecto usa `@Injectable`, que sigue siendo válido y es compatible con la inyección por constructor que usan varios servicios (`Sesion`, `Funciones`, `Productos`, `Validacion`); ambos producen una única instancia compartida.

---

## 7. Limitaciones conocidas

- **Cupones validados en el cliente.** Cualquiera con la anon key podría consultar la lista de códigos. En producción la validación iría en el servidor (función SQL / Edge Function).
- **Puntos:** `sumar_puntos` recibe la cantidad desde el cliente. Ya no se pueden sumar puntos a otra persona, pero un usuario técnico podría sumárselos a sí mismo; la solución sería calcularlos en la base a partir del total de la compra.
- **Restricción de edad para anónimos:** es un aviso, no un control. Un menor con cuenta puede cerrar sesión y comprar como anónimo.
- **Alertas de estreno:** se guarda la suscripción del usuario, pero **no hay mecanismo que dispare la notificación** (requeriría un cron o una Edge Function) ni pantalla "Mis alertas".
- **"Películas vistas"** se calcula a partir de las compras, no de la asistencia validada.
- **Escaneo de QR con cámara:** el empleado ingresa el código manualmente; el escaneo por cámara se evaluó y se descartó para acotar el alcance.
- **Zona horaria:** la ventana de cancelación de 2 horas usa la hora de Argentina fija dentro de la función SQL; no se adapta a otras zonas.
- **Confirmación de email deshabilitada** para simplificar el desarrollo (ver sección 2 para el motivo y la alternativa).

---

## 8. Estado del proyecto

| Split | Descripción | Estado |
|---|---|---|
| 1–6 | Análisis, estructura, Supabase, películas, usuarios, salas/funciones | ✅ |
| 7 | Compra de entradas (butacas, precios, +18, QR, PDF) | ✅ |
| 8 | Candy Bar y combos | ✅ |
| 9 | Cupones, puntos y recompensas | ✅ |
| 10 | Reseñas, próximamente, mis películas | ✅ |
| 11 | Validación de entradas (empleados) | ✅ |
| 12 | Reportes, estadísticas y log | ✅ |
| 13 | Preventa, cancelaciones y crédito | ✅ |
| 14 | PWA, pruebas y mejoras visuales | 🟡 Estilos globales aplicados; PWA y pruebas pendientes |
| 15 | Despliegue y documentación final | 🟡 Desplegado en Firebase Hosting; faltan capturas de pantalla |
