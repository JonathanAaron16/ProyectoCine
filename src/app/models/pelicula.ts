// models/pelicula.ts
export interface Pelicula {
  id: number;
  nombre: string;
  imagen: string;
  sinopsis: string;
  duracionMinutos: number;
  generos: string[];
  clasificacionEdad: 'ATP' | '+13' | '+18';
  idioma: 'Castellano' | 'Subtitulada';
  modalidad: '2D' | '3D' | '4D' | '5D';
  publicada: boolean;       // si está disponible en cartelera
  destacada: boolean;       // si se muestra en la página principal
  tienePreventa: boolean;
  fechaEstreno?: string;    // para "Próximamente"
}