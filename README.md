# 🎬 Cine App — TP 1, Programación IV (A344)

Sistema de gestión de cine desarrollado en Angular (standalone components + Signal Forms) y Supabase (base de datos, autenticación y storage).

## Stack técnico

- **Angular** (standalone, sin NgModules) — componentes con `loadComponent` (lazy loading)
- **Angular Signal Forms** (`@angular/forms/signals`) para todos los formularios
- **Supabase** — base de datos Postgres, autenticación, Row Level Security
- **qrcode** y **jsPDF** — generación de comprobantes de compra

## Cómo correr el proyecto

```bash
npm install
ng serve
```

Completar `src/environments/environment.ts` con la URL y la anon key del proyecto de Supabase antes de levantar la app.

---

## Checklist de splits

### ✅ Split 1 — Análisis y planificación
- [x] Documento de requerimientos
- [x] Actores y entidades definidas
- [x] Funcionalidades obligatorias vs. secundarias

### ✅ Split 2 — Estructura Angular
- [x] Estructura de carpetas (`componentes/`, `models/`, `servicios/`)
- [x] Encabezado, pie de página, layout general
- [x] Rutas con lazy loading
- [x] Pantallas base: Inicio, Listado de películas, Detalle, Login, Registro, Compra, Admin

### ✅ Split 3 — Base de datos y conexión con Supabase
- [x] Proyecto de Supabase creado y conectado
- [x] Tablas: `usuarios`, `generos`, `peliculas`, `peliculas_generos`, `salas`, `butacas`, `funciones`
- [x] Políticas de RLS (lectura pública / escritura admin)

### ✅ Split 4 — Gestión de películas
- [x] Listado con buscador y filtro por género
- [x] Detalle de película con reseñas y promedio de calificación
- [x] Alta, edición y eliminación desde el panel de administración

### ✅ Split 5 — Usuarios, login y registro
- [x] Registro con perfil completo (nombre, apellido, tipo de sangre, color de ojos, días de vacaciones)
- [x] Login con redirección según rol
- [x] Servicio de sesión reactivo (`Sesion`)
- [x] Guard de administrador (`admin-guard`)
- [x] Guard de formularios sin guardar (`form-guard`)

### ✅ Split 6 — Salas, butacas y funciones
- [x] Generación automática de butacas (518 por sala: comunes, accesibles, VIP)
- [x] Distribución con pasillos reales (filas A-I, J accesible, L-Q, R-S-T VIP)
- [x] Alta de funciones con asignación automática de sala (respetando 30 min de buffer)

### 🟡 Split 7 — Compra de entradas
- [x] Selección de función desde el detalle de película
- [x] Mapa de butacas con disponibilidad (actualizada por polling)
- [x] Cálculo de precio con recargo VIP
- [x] Verificación de restricción de edad (+18)
- [x] Confirmación de compra contra Supabase (con protección de doble venta)
- [x] Generación de código QR
- [x] Comprobante descargable en PDF
- [ ] Pulir mapa de butacas (espaciado visual de sectores) — en progreso

### ⬜ Split 8 — Candy Bar y combos
- [ ] ABM de productos y combos
- [ ] Carrito combinado con entradas
- [ ] Retiro de productos con el mismo QR de la compra

### ⬜ Split 9 — Cupones, descuentos y fidelización
- [ ] Cupones (primera compra, mayores de 50, generales)
- [ ] Sistema de puntos
- [ ] Recompensas y canje

### ⬜ Split 10 — Reseñas, próximas películas y "Mis películas"
- [x] Lectura de reseñas (hecho en Split 4)
- [ ] Carga de reseñas desde el cliente
- [ ] Sección "Próximamente"
- [ ] Alertas de estreno

### ⬜ Split 11 — Validación de entradas (empleados)
- [ ] Escaneo/validación de QR en el ingreso
- [ ] Marcado de entradas como usadas

### ⬜ Split 12 — Reportes, estadísticas y log de actividad
- [ ] Reportes de ventas
- [ ] Log de actividad del panel admin

### ⬜ Split 13 — Preventa, cancelaciones y crédito
- [ ] Preventa de funciones
- [ ] Cancelación de compras
- [ ] Sistema de crédito a favor

---

## Estructura del proyecto

```
src/app/
├── componentes/
│   ├── encabezado/
│   ├── pie-pagina/
│   ├── inicio/
│   ├── peliculas/
│   │   ├── listado/
│   │   └── detalle/
│   ├── login/
│   ├── registro/
│   ├── compra/
│   └── admin/
│       ├── peliculas-form/
│       ├── salas/
│       ├── salas-form/
│       ├── funciones/
│       └── funciones-form/
├── guards/
│   ├── admin-guard.ts
│   └── form-guard.ts
├── models/
├── servicios/
├── app.ts
├── app.html
├── app.routes.ts
└── app.config.ts
```
