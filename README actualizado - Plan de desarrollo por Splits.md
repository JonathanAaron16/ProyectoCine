# Proyecto CineApp

Aplicación web para la gestión y compra de entradas de cine, desarrollada para el Trabajo Práctico 1 de Programación IV - 2026.

El sistema contempla la visualización de películas, consulta de funciones, selección de butacas, compra de entradas, gestión de productos de Candy Bar, autenticación de usuarios, administración del cine, generación de comprobantes y otras funcionalidades solicitadas en la consigna.

---

# Tecnologías utilizadas

- Angular 22
- TypeScript
- HTML
- CSS
- Angular Router
- Angular Forms
- RxJS
- Supabase
- Git y GitHub
- PWA
- Generación de archivos PDF
- Generación y validación de códigos QR

---

# Arquitectura actual del proyecto

El proyecto utiliza una arquitectura basada en componentes standalone de Angular.

La organización principal se encuentra dentro de:

```text
src/app/componentes/
```

Dentro de esta carpeta se encuentran los componentes correspondientes a las diferentes pantallas y funcionalidades del sistema.

La estructura actual incluye:

```text
src/
└── app/
    ├── componentes/
    │   ├── admin/
    │   ├── compra/
    │   ├── encabezado/
    │   ├── error/
    │   ├── inicio/
    │   ├── login/
    │   ├── peliculas/
    │   │   ├── listado/
    │   │   └── detalle/
    │   └── registro/
    ├── app.config.ts
    ├── app.routes.ts
    └── app.component.*
```

La aplicación utiliza rutas configuradas mediante Angular Router y carga componentes de forma diferida utilizando `loadComponent`.

---

# Rutas actuales

Las rutas configuradas actualmente son:

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Inicio` | Página principal del cine |
| `/peliculas` | `Listado` | Listado de películas |
| `/peliculas/:id` | `Detalle` | Detalle de una película |
| `/login` | `Login` | Inicio de sesión |
| `/registro` | `Registro` | Registro de usuarios |
| `/compra/:funcionId` | `Compra` | Proceso de compra |
| `/admin` | `Admin` | Panel de administración |
| `**` | `Error` | Página para rutas inexistentes |

---

# Plan de desarrollo por Splits

## Split 1 — Análisis y planificación del proyecto

### Objetivo

Analizar la consigna del trabajo práctico y definir las funcionalidades principales que tendrá la aplicación.

### Actividades realizadas

- Lectura de la consigna del Trabajo Práctico 1.
- Identificación de los actores del sistema.
- Identificación de las funcionalidades principales.
- Identificación de las entidades que serán necesarias.
- Análisis de las reglas de negocio.
- Identificación de las pantallas principales.
- Organización de las funcionalidades obligatorias y complementarias.
- Definición de las tecnologías que se utilizarán.
- Análisis de la arquitectura general de la aplicación.
- Organización inicial del trabajo en diferentes etapas.

### Actores identificados

- Cliente no registrado.
- Usuario registrado.
- Administrador.
- Empleado encargado de validar entradas.

### Funcionalidades identificadas

- Visualización de películas.
- Consulta de detalles de películas.
- Registro e inicio de sesión.
- Consulta de funciones.
- Selección de butacas.
- Compra de entradas.
- Compra de productos de Candy Bar.
- Gestión de películas.
- Gestión de salas y funciones.
- Validación de códigos QR.
- Gestión de usuarios.
- Gestión de cupones.
- Sistema de puntos y fidelización.
- Reportes y estadísticas.
- Registro de actividades del sistema.

### Resultado esperado

Se obtuvo una visión general del sistema y una división de las funcionalidades para poder desarrollar el proyecto de forma progresiva.

### Estado

**Completado.**

---

## Split 2 — Creación del proyecto y estructura inicial de Angular

### Objetivo

Crear el proyecto Angular y establecer la estructura inicial de la aplicación.

### Actividades realizadas

- Creación del proyecto utilizando Angular CLI.
- Configuración inicial de Angular.
- Uso de componentes standalone.
- Configuración de TypeScript.
- Instalación de las dependencias necesarias.
- Instalación de la librería de Supabase.
- Creación de los componentes principales.
- Organización de los componentes dentro de `src/app/componentes/`.
- Configuración inicial de Angular Router.
- Creación de las rutas principales.
- Creación de la página de inicio.
- Creación del encabezado de la aplicación.
- Creación de la pantalla de listado de películas.
- Creación de la pantalla de detalle de películas.
- Creación de la pantalla de inicio de sesión.
- Creación de la pantalla de registro.
- Creación de la pantalla de compra.
- Creación del panel inicial de administración.
- Creación de la página de error para rutas inexistentes.
- Configuración de rutas dinámicas para el detalle de películas y la compra.
- Publicación del código en GitHub.

### Componentes creados

- `Inicio`
- `Encabezado`
- `Listado`
- `Detalle`
- `Login`
- `Registro`
- `Compra`
- `Admin`
- `Error`



### Decisiones técnicas

- Se utilizaron componentes standalone, sin depender de módulos tradicionales de Angular.
- Se utilizó Angular Router para la navegación entre pantallas.
- Se utilizaron rutas dinámicas para identificar películas y funciones.
- Se organizó el código por componentes y funcionalidades.
- Se incorporó Supabase como dependencia para la futura conexión con la base de datos y los servicios del sistema.
- Se utilizó GitHub para versionar y almacenar el código fuente.

### Resultado esperado

Se obtuvo una aplicación Angular funcional en su estructura inicial, con las principales pantallas creadas y las rutas configuradas.

### Estado

**Completado en su estructura inicial.**

---

## Split 3 — Configuración de Supabase y modelo de datos

### Objetivo

Configurar Supabase y crear la estructura de datos necesaria para almacenar la información del cine.

### Actividades

- Crear el proyecto en Supabase.
- Configurar las credenciales de conexión.
- Crear el archivo o servicio de configuración de Supabase.
- Definir las interfaces de TypeScript.
- Diseñar las tablas principales.
- Definir las relaciones entre las tablas.
- Configurar claves primarias y foráneas.
- Definir restricciones y campos obligatorios.
- Crear servicios para consultar y modificar los datos.
- Probar la conexión desde Angular.

### Tablas previstas

- Usuarios.
- Películas.
- Géneros.
- Relación entre películas y géneros.
- Salas.
- Butacas.
- Funciones.
- Compras.
- Detalle de compras.
- Productos de Candy Bar.
- Categorías de productos.
- Combos.
- Cupones.
- Reseñas.
- Puntos de fidelización.
- Movimientos de puntos.
- Créditos por cancelaciones.
- Validaciones de códigos QR.
- Registro de actividades.

### Estado

**En desarrollo.**

La dependencia de Supabase ya fue incorporada al proyecto, pero la conexión funcional y la estructura completa de la base de datos deben terminar de implementarse.

---

## Split 4 — Gestión de películas

### Objetivo

Desarrollar la funcionalidad para visualizar y administrar las películas disponibles en el cine.

### Actividades

- Crear el modelo de película.
- Mostrar el listado de películas.
- Mostrar la imagen de cada película.
- Mostrar nombre, sinopsis y duración.
- Mostrar géneros.
- Mostrar formato de proyección.
- Mostrar idioma.
- Mostrar clasificación por edad.
- Crear la vista de detalle de una película.
- Agregar búsqueda de películas.
- Agregar filtros por género.
- Permitir que el administrador cree películas.
- Permitir modificar películas.
- Permitir eliminar o deshabilitar películas.
- Permitir marcar películas como próximas a estrenarse.

### Estado

**En desarrollo.**

Ya se encuentran creadas las pantallas de listado y detalle de películas. Falta completar la conexión con los datos reales y las operaciones de administración.

---

## Split 5 — Usuarios, registro e inicio de sesión

### Objetivo

Implementar el sistema de usuarios y el acceso autenticado a la aplicación.

### Actividades

- Crear formulario de registro.
- Crear formulario de inicio de sesión.
- Validar campos obligatorios.
- Validar formato del correo electrónico.
- Validar contraseña.
- Registrar usuarios en Supabase.
- Iniciar sesión.
- Cerrar sesión.
- Mostrar información del usuario autenticado.
- Crear perfiles de usuario.
- Diferenciar clientes, administradores y empleados.
- Proteger las rutas privadas.
- Restringir el acceso al panel de administración.

### Datos del usuario

- Correo electrónico.
- Nombre.
- Apellido.
- Fecha de nacimiento.
- Tipo de sangre.
- Color de ojos.
- Días de vacaciones.
- Rol dentro del sistema.

### Estado

**En desarrollo.**

Ya se encuentran creadas las pantallas de login y registro. Falta completar la autenticación real y la conexión con Supabase.


## Split 7 — Selección y compra de entradas

### Objetivo

Desarrollar el proceso completo de compra de entradas.

### Actividades

- Seleccionar una película.
- Seleccionar una función.
- Mostrar las butacas disponibles.
- Seleccionar una o varias butacas.
- Evitar que dos usuarios compren la misma butaca.
- Actualizar la disponibilidad en tiempo real.
- Calcular el precio total.
- Aplicar descuentos.
- Validar restricciones de edad.
- Mostrar aviso cuando sea necesaria la presencia de un adulto.
- Permitir compras de usuarios registrados.
- Permitir compras anónimas.
- Confirmar la compra.
- Registrar la operación.
- Generar comprobante.
- Generar código QR.
- Generar entrada en PDF.

### Estado

**En desarrollo inicial.**

Ya existe el componente de compra y una ruta dinámica basada en el identificador de la función. Falta implementar la lógica completa de selección, disponibilidad, pago y confirmación.


---

# Estado general del proyecto

| Split | Tema | Estado |
|---|---|---|
| 1 | Análisis y planificación | Completado |
| 2 | Creación del proyecto y estructura inicial | Completado en su estructura inicial |
| 3 | Supabase y modelo de datos | En desarrollo |
| 4 | Gestión de películas | En desarrollo |
| 5 | Usuarios, registro e inicio de sesión | En desarrollo |
| 6 | Salas, butacas y funciones | Pendiente |
| 7 | Selección y compra de entradas | En desarrollo inicial |
| 8 | Candy Bar y combos | Pendiente |
| 9 | Cupones, descuentos y fidelización | Pendiente |
| 10 | Reseñas, próximas películas y Mis películas | Pendiente |
| 11 | Validación de códigos QR | Pendiente |
| 12 | Panel de administración | En desarrollo inicial |
| 13 | Reportes, estadísticas y log | Pendiente |
| 14 | Preventa, cancelaciones y créditos | Pendiente |
| 15 | PWA, validaciones y diseño responsive | Pendiente |
| 16 | Pruebas e integración general | Pendiente |
| 17 | Despliegue y documentación final | Pendiente |

---

# Funcionalidades principales del sistema

El sistema deberá permitir:

- Consultar películas disponibles.
- Buscar películas por nombre.
- Filtrar películas por género.
- Consultar información detallada de cada película.
- Registrarse e iniciar sesión.
- Consultar funciones.
- Seleccionar butacas.
- Comprar entradas.
- Comprar productos de Candy Bar.
- Aplicar cupones y descuentos.
- Generar comprobantes en PDF.
- Generar códigos QR.
- Validar códigos QR.
- Gestionar películas, salas, funciones y productos.
- Administrar usuarios y permisos.
- Acumular y utilizar puntos.
- Consultar películas próximas a estrenarse.
- Cancelar compras dentro del plazo permitido.
- Generar créditos por cancelaciones.
- Consultar reportes y estadísticas.
- Registrar las actividades realizadas por los usuarios administrativos.


---

# Repositorio

El código fuente del proyecto se encuentra alojado en GitHub:

`https://github.com/JonathanAaron16/ProyectoCine`
