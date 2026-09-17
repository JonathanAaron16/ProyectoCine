import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Pelicula } from '../../../models/pelicula';
import { Resena } from '../../../models/resena';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css'
})
export class Detalle {
  pelicula: Pelicula | undefined;
  resenas: Resena[] = [];

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPelicula(id);
  }

  private cargarPelicula(id: number) {
    // Hardcodeado por ahora — en el Split 3 esto se reemplaza por un servicio a Supabase
    const peliculas: Pelicula[] = [
      {
        id: 1, nombre: 'Viaje a las estrellas', imagen: 'https://placehold.co/300x450',
        sinopsis: 'Una tripulación explora los confines del universo en busca de un nuevo hogar para la humanidad.',
        duracionMinutos: 128, generos: ['Ciencia ficción', 'Aventura'],
        clasificacionEdad: 'ATP', idioma: 'Castellano', modalidad: '3D',
        publicada: true, destacada: true, tienePreventa: false
      },
      {
        id: 2, nombre: 'La última noche', imagen: 'https://placehold.co/300x450',
        sinopsis: 'Un thriller psicológico sobre decisiones límite.',
        duracionMinutos: 105, generos: ['Suspenso'],
        clasificacionEdad: '+13', idioma: 'Subtitulada', modalidad: '2D',
        publicada: true, destacada: true, tienePreventa: true
      }
    ];

    this.pelicula = peliculas.find(p => p.id === id);

    this.resenas = [
      { id: 1, peliculaId: id, usuarioId: 10, calificacion: 5, comentario: 'Excelente, muy recomendable.', fecha: '2026-09-01' },
      { id: 2, peliculaId: id, usuarioId: 11, calificacion: 4, comentario: 'Muy buena fotografía.', fecha: '2026-09-05' }
    ];
  }

  get promedioCalificacion(): number {
    if (this.resenas.length === 0) return 0;
    const suma = this.resenas.reduce((acc, r) => acc + r.calificacion, 0);
    return Math.round((suma / this.resenas.length) * 10) / 10;
  }
}