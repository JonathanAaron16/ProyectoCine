export interface Funcion {
  id: number;
  peliculaId: number;
  salaId: number;
  fecha: string;
  hora: string;
  horaFin: string;
  idioma: 'Castellano' | 'Subtitulada';
  modalidad: '2D' | '3D' | '4D' | '5D';
  precioBase: number;
}