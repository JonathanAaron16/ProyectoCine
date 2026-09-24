# Sistema de gestión y venta de entradas para cine

## 1. Descripción general

El proyecto consiste en desarrollar una aplicación web para un establecimiento de cine que permita a los clientes consultar películas, elegir funciones, seleccionar butacas y comprar entradas.

La aplicación también deberá contar con un panel de administración para gestionar películas, salas, funciones, butacas, productos del Candy Bar, cupones, combos, usuarios y reportes.

El sistema deberá utilizar Angular, Supabase y las tecnologías vistas durante la cursada. Además, deberá contar con una interfaz visual propia, fácil de utilizar y una versión desplegada con una URL funcional.

---

## 2. Requerimientos generales

- Desarrollar una aplicación web para la gestión integral de un cine.
- Permitir la compra de entradas desde la página.
- Permitir compras tanto para usuarios registrados como para usuarios anónimos.
- Generar un comprobante de compra en PDF.
- Generar un código QR asociado a la compra.
- Utilizar el código QR para validar el ingreso al cine y retirar productos del Candy Bar.
- Implementar la aplicación utilizando Angular.
- Integrar la aplicación con Supabase.
- Incorporar características de PWA.
- Aplicar buenas prácticas y técnicas vistas en clase.
- Crear una interfaz visual original, clara y fácil de navegar.
- Desplegar la aplicación y proporcionar una URL funcional.
- Publicar el código fuente en GitHub.
- Documentar la arquitectura y las decisiones técnicas.

---

## 3. Gestión de películas

Cada película deberá contar, como mínimo, con los siguientes datos:

- Nombre.
- Imagen o póster.
- Sinopsis.
- Duración.
- Género o géneros.
- Clasificación de edad.
- Modalidad de proyección:
  - 2D.
  - 3D.
  - 4D.
  - 5D.
- Idioma:
  - Castellano.
  - Subtitulada.
- Estado de publicación o disponibilidad.

El administrador deberá poder:

- Crear películas.
- Modificar películas.
- Eliminar películas.
- Elegir qué películas se muestran en la página principal.
- Configurar los datos de cada película.
- Definir sus horarios y funciones.
- Configurar la clasificación de edad.
- Configurar si una película tiene preventa.

---

## 4. Cartelera y búsqueda de películas

La aplicación deberá permitir que los usuarios:

- Consulten las películas disponibles.
- Visualicen información detallada de cada película.
- Busquen películas por nombre.
- Filtren películas por género.
- Consulten películas que tengan más de un género.
- Visualicen las tres películas más vendidas en la página principal.
- Consulten una sección de películas próximas a estrenarse.

---

## 5. Reseñas y calificaciones

Los usuarios deberán poder:

- Calificar películas mediante estrellas.
- Dejar un comentario corto sobre una película.
- Consultar las reseñas antes de comprar entradas.
- Visualizar la puntuación promedio de cada película.

---

## 6. Salas y distribución de butacas

El cine contará con varias salas.

La distribución original de cada sala será de:

- 20 filas identificadas con letras.
- 3 sectores de butacas:
  - 4 butacas.
  - 20 butacas.
  - 4 butacas.

Posteriormente, se modificará la distribución para incluir butacas accesibles:

- Se eliminarán las filas J y K.
- Se incorporará una fila adaptada para personas con discapacidad.
- La distribución de las butacas accesibles será:
  - 2 butacas.
  - 10 butacas.
  - 2 butacas.

Además, se deberán incorporar butacas VIP en las últimas tres filas:

- Filas R, S y T.
- Tendrán un precio superior.
- Deberán marcarse visualmente de forma diferente.
- El usuario deberá saber que está seleccionando una butaca VIP antes de pagar.

El administrador deberá poder:

- Gestionar las salas.
- Configurar la distribución de las butacas.
- Identificar las butacas comunes, accesibles y VIP.
- Visualizar el mapa de butacas.

---

## 7. Funciones y asignación de salas

El administrador deberá poder:

- Crear funciones.
- Modificar funciones.
- Eliminar funciones.
- Definir el día y horario de cada función.
- Definir la película que se proyectará.
- Definir la modalidad de proyección.
- Definir el idioma.
- Configurar la duración de la película.

El sistema deberá respetar las siguientes reglas:

- No podrá existir una función antes de que transcurran 30 minutos desde la finalización de la función anterior en la misma sala.
- Dos funciones no podrán ocupar la misma sala al mismo tiempo.
- La asignación de salas deberá realizarse automáticamente.
- El sistema deberá asignar una sala disponible según el día y horario seleccionado.
- Una película podrá proyectarse en distintos días y horarios.

---

## 8. Selección de butacas y disponibilidad en tiempo real

Durante la compra, el usuario deberá poder:

- Visualizar el mapa de butacas de la sala.
- Seleccionar una o varias butacas.
- Ver cuáles están disponibles.
- Ver cuáles están ocupadas.
- Visualizar en tiempo real las butacas que fueron ocupadas por otros usuarios.
- Identificar visualmente las butacas accesibles.
- Identificar visualmente las butacas VIP.
- Conocer el precio de las butacas seleccionadas antes de pagar.

El sistema deberá evitar que dos usuarios compren la misma butaca para la misma función.

---

## 9. Usuarios y registro

Los usuarios registrados deberán poder crear una cuenta con los siguientes datos:

- Correo electrónico.
- Nombre.
- Apellido.
- Fecha de nacimiento.
- Tipo de sangre.
- Color de ojos.
- Cantidad de días de vacaciones por año.

Los usuarios anónimos también podrán comprar entradas, siempre que completen el proceso de pago.

Los usuarios registrados deberán contar con un perfil donde puedan consultar:

- Sus datos personales.
- Sus puntos de fidelización.
- Su historial de canjes.
- Su crédito disponible.
- Sus películas vistas.
- Sus calificaciones realizadas.

---

## 10. Cupones y descuentos

El sistema deberá permitir:

- Otorgar un cupón de descuento del 20% por la primera compra de un usuario registrado.
- Configurar el porcentaje del cupón desde el panel de administración.
- Crear cupones especiales para usuarios mayores de 50 años.
- Aplicar cupones durante el proceso de compra.
- Configurar las condiciones de uso de los cupones.

---

## 11. Compra de entradas

El usuario deberá poder:

1. Seleccionar una película.
2. Seleccionar una función.
3. Seleccionar una o varias butacas.
4. Agregar productos del Candy Bar, si lo desea.
5. Aplicar un cupón o descuento.
6. Consultar el importe total.
7. Realizar el pago.
8. Obtener el comprobante de compra.
9. Recibir un PDF con los datos de la compra.
10. Obtener un código QR para presentar en el cine.

El comprobante deberá incluir información como:

- Película.
- Fecha y horario.
- Sala.
- Butacas seleccionadas.
- Tipo de butaca.
- Productos comprados.
- Importe total.
- Código QR.

---

## 12. Cancelación de compras

Los usuarios podrán cancelar una compra hasta dos horas antes del comienzo de la función.

En caso de cancelación:

- No se devolverá dinero.
- El importe se convertirá en crédito para futuras compras.
- El crédito deberá aparecer en el perfil del usuario.
- El crédito podrá utilizarse junto con otros métodos de pago.

---

## 13. Candy Bar

La aplicación deberá permitir la venta de productos del Candy Bar, como:

- Pochoclos.
- Bebidas.
- Combos.
- Otros productos.

El administrador deberá poder:

- Crear productos.
- Modificar productos.
- Eliminar productos.
- Asignar productos a categorías.
- Configurar precios.
- Gestionar combos especiales.

Los usuarios deberán poder:

- Comprar productos junto con las entradas.
- Consultar los productos disponibles.
- Agregar productos al carrito.
- Ver el importe total de la compra.
- Retirar los productos utilizando el mismo código QR de la compra.

---

## 14. Combos especiales

El sistema deberá permitir crear combos que incluyan, por ejemplo:

- Entrada.
- Pochoclos.
- Bebida.

Los combos deberán:

- Tener un precio fijo configurable.
- Ser administrables desde el panel de administración.
- Aparecer destacados en la página de compra.
- Poder adquirirse junto con las entradas.

---

## 15. Validación de códigos QR

Los empleados deberán contar con una sección para validar códigos QR.

El sistema deberá permitir:

- Escanear el código QR de una entrada.
- Escanear el código QR de una compra del Candy Bar.
- Ingresar manualmente el código si el lector no funciona.
- Validar la entrada para permitir el ingreso.
- Validar la entrega de productos.
- Impedir que un código QR se utilice más de una vez.
- Registrar cuándo se validó el código.
- Registrar qué empleado realizó la validación.

Una vez que una entrada sea validada o que los productos sean entregados, el código QR deberá dejar de funcionar para esa operación.

---

## 16. Restricciones de edad

Algunas películas tendrán restricciones de edad:

- Sin restricción.
- Apta para mayores de 13 años.
- Apta para mayores de 18 años.

El sistema deberá:

- Verificar la edad del usuario cuando corresponda.
- Impedir que un usuario menor compre una entrada para una película restringida.
- Informar cuando una entrada requiera que el menor asista acompañado por un adulto.
- Mostrar claramente la clasificación de edad de cada película.

---

## 17. Programa de fidelización

Los usuarios registrados acumularán puntos cada vez que realicen una compra.

Reglas del programa:

- Por cada peso gastado se otorgará un punto.
- Los puntos no podrán transferirse entre usuarios.
- Los puntos podrán canjearse por entradas gratuitas.
- Los puntos podrán canjearse por productos del Candy Bar.
- El administrador podrá configurar cuántos puntos cuesta cada recompensa.

Ejemplos de recompensas configurables:

- Entrada gratuita: 500 puntos.
- Pochoclo grande: 150 puntos.

El usuario deberá poder consultar:

- Cantidad de puntos acumulados.
- Recompensas disponibles.
- Historial de canjes.
- Puntos utilizados.

---

## 18. Películas próximamente

La aplicación deberá contar con una sección llamada **“Próximamente”**.

Esta sección deberá mostrar:

- Películas que se estrenarán en las próximas semanas.
- Fecha estimada de estreno.
- Imagen o póster.
- Nombre.
- Sinopsis.
- Clasificación de edad, si corresponde.

Los usuarios podrán:

- Activar una alerta para una película.
- Recibir una notificación cuando las entradas estén disponibles para la venta.

---

## 19. Sistema de preventa

El sistema deberá permitir configurar la preventa de entradas por película.

Requerimientos:

- La venta podrá abrirse siete días antes del estreno.
- Durante la preventa se aplicará un precio especial.
- Una vez finalizada la preventa, el precio volverá al valor normal.
- La preventa deberá poder configurarse película por película.
- El administrador deberá poder definir el precio de preventa.

---

## 20. Sección “Mis películas”

Los usuarios registrados deberán contar con una sección llamada **“Mis películas”**.

En esta sección podrán visualizar un historial de las películas que vieron, incluyendo:

- Póster de la película.
- Nombre.
- Fecha en la que asistieron.
- Calificación realizada por el usuario.

---

## 21. Panel de administración

El sistema deberá contar con un usuario administrador que pueda controlar:

- Películas.
- Salas.
- Distribución de butacas.
- Funciones.
- Horarios.
- Productos del Candy Bar.
- Categorías.
- Precios.
- Combos.
- Cupones.
- Descuentos.
- Recompensas del sistema de puntos.
- Preventas.
- Reportes.
- Actividad del sistema.

También deberán existir usuarios empleados que puedan:

- Validar entradas.
- Validar productos del Candy Bar.
- Escanear códigos QR.
- Ingresar códigos manualmente.
- Registrar las operaciones realizadas.

---

## 22. Reportes y estadísticas

El administrador deberá poder consultar un reporte que indique:

- Cuánto se facturó por día.
- Cuántas entradas se vendieron.
- Cuáles fueron las películas más vistas por semana.
- Cuáles fueron las películas más vistas por mes.
- Cuál fue el producto del Candy Bar más vendido.

Además, el sistema deberá permitir:

- Exportar el reporte de facturación a PDF.
- Exportar el reporte de facturación a Excel.
- Visualizar gráficos estadísticos.

---

## 23. Registro de actividad

El panel de administración deberá contar con un log de actividad.

El sistema deberá registrar:

- Quién creó una función.
- Quién modificó un precio.
- Quién validó un código QR.
- Qué acción se realizó.
- Fecha de la acción.
- Hora de la acción.

El registro deberá permitir consultar la actividad realizada por administradores y empleados.

---

## 24. Usabilidad y diseño

La aplicación deberá:

- Ser fácil de navegar.
- Ser fácil de entender para clientes, empleados y administradores.
- Evitar formularios difíciles de utilizar.
- Facilitar la selección de fechas y horarios.
- Evitar el exceso de desplazamiento vertical.
- Mostrar la información de forma clara.
- Utilizar controles adecuados para fechas y horas.
- Diferenciar visualmente las butacas comunes, accesibles y VIP.
- Destacar los combos y las promociones.
- Tener un estilo visual propio y producido.

---

## 25. Funcionalidad propuesta, pendiente de aprobación

Se propuso agregar una pantalla con un mapa general del cine que permita indicar en qué sala se compró la entrada.

Esta funcionalidad queda pendiente de aprobación y no debe considerarse obligatoria hasta que sea confirmada.

---

## 26. Resumen de actores del sistema

### Cliente anónimo

Puede:

- Consultar películas.
- Buscar y filtrar películas.
- Consultar funciones.
- Seleccionar butacas.
- Comprar entradas.
- Comprar productos del Candy Bar.
- Aplicar descuentos disponibles.
- Obtener el comprobante y el código QR.

### Cliente registrado

Puede realizar todas las acciones del cliente anónimo y además:

- Gestionar su perfil.
- Recibir el cupón de primera compra.
- Acumular puntos.
- Canjear recompensas.
- Consultar su crédito.
- Cancelar compras según las condiciones.
- Recibir alertas de próximos estrenos.
- Consultar la sección “Mis películas”.
- Dejar reseñas y calificaciones.

### Empleado

Puede:

- Escanear códigos QR.
- Ingresar códigos manualmente.
- Validar entradas.
- Validar entregas del Candy Bar.
- Registrar las operaciones realizadas.

### Administrador

Puede:

- Gestionar películas.
- Gestionar salas y butacas.
- Gestionar funciones y horarios.
- Gestionar productos y combos.
- Gestionar precios, cupones y descuentos.
- Configurar preventas y recompensas.
- Consultar reportes.
- Exportar información.
- Consultar el log de actividad.

---

## 27. Tecnologías y condiciones solicitadas

La aplicación deberá contemplar:

- Angular.
- Supabase.
- PWA.
- Código publicado en GitHub.
- Aplicación desplegada.
- URL funcional.
- README con arquitectura y decisiones técnicas.
- Buenas prácticas de desarrollo.
- Uso de los temas vistos durante la cursada.
- Defensa oral de las decisiones tomadas.