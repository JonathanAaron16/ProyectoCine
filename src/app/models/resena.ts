export interface Resena {
  id: number;
  peliculaId: number;
  usuarioId: String;
  calificacion: number;   // 1 a 5
  comentario: string;
  fecha: string;
}