export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  tipoSangre: string;           // ej: 'A+', 'O-', etc.
  colorOjos: string;
  diasVacaciones: number;
  rol: 'cliente' | 'empleado' | 'administrador';

  // datos que se van completando con el uso del sistema (no van en el form de registro)
  puntos?: number;
  credito?: number;
}