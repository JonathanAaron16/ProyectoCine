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
  fechaEstreno?: string | null;    // para "Próximamente"
}

// models/pelicula.ts — agregamos esta función utilitaria al final del archivo
// Convierte una fila de la base de datos al modelo utilizado por la aplicación.
export function mapearPelicula(fila: any): Pelicula {
  return {
    id: fila.id,
    nombre: fila.nombre,
    imagen: fila.imagen,
    sinopsis: fila.sinopsis,
    duracionMinutos: fila.duracionMinutos,
    generos: (fila.peliculas_generos ?? []).map((pg: any) => pg.generos.nombre),
    clasificacionEdad: fila.clasificacionEdad,
    idioma: fila.idioma,
    modalidad: fila.modalidad,
    publicada: fila.publicada,
    destacada: fila.destacada,
    tienePreventa: fila.tienePreventa,
    fechaEstreno: fila.fechaEstreno,
  };
}