export interface Resena {
  id: number;
  peliculaId: number;
  usuarioId: number;
  calificacion: number;   // 1 a 5
  comentario: string;
  fecha: string;
}