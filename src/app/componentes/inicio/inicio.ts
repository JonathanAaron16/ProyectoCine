import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mapearPelicula, Pelicula } from '../../models/pelicula';
import { Peliculas } from '../../servicios/peliculas';

@Component({
  selector: 'app-inicio',
  
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  // Hardcodeado por ahora — en el Split 3 esto se reemplaza por un servicio a Supabase
  // peliculasDestacadas: Pelicula[] = [
  //   {
  //     id: 1,
  //     nombre: 'Viaje a las estrellas',
  //     imagen: 'https://placehold.co/300x450',
  //     sinopsis: 'Una tripulación explora los confines del universo.',
  //     duracionMinutos: 128,
  //     generos: ['Ciencia ficción', 'Aventura'],
  //     clasificacionEdad: 'ATP',
  //     idioma: 'Castellano',
  //     modalidad: '3D',
  //     publicada: true,
  //     destacada: true,
  //     tienePreventa: false
  //   },
  //   {
  //     id: 2,
  //     nombre: 'La última noche',
  //     imagen: 'https://placehold.co/300x450',
  //     sinopsis: 'Un thriller psicológico sobre decisiones límite.',
  //     duracionMinutos: 105,
  //     generos: ['Suspenso'],
  //     clasificacionEdad: '+13',
  //     idioma: 'Subtitulada',
  //     modalidad: '2D',
  //     publicada: true,
  //     destacada: true,
  //     tienePreventa: true
  //   },
  //   {
  //     id: 3,
  //     nombre: 'Risas en cadena',
  //     imagen: 'https://placehold.co/300x450',
  //     sinopsis: 'Comedia sobre un grupo de amigos en crisis.',
  //     duracionMinutos: 95,
  //     generos: ['Comedia'],
  //     clasificacionEdad: 'ATP',
  //     idioma: 'Castellano',
  //     modalidad: '2D',
  //     publicada: true,
  //     destacada: true,
  //     tienePreventa: false
  //   }
  // ];
  peliculasDestacadas = signal<Pelicula[]>([]);
  cargando = signal(true);

  textoBusqueda: string = '';
  generoSeleccionado: string = '';



 constructor(private peliculasService: Peliculas) {}

  ngOnInit() {
    this.peliculasService.obtenerDestacadas().then(resultado => {
      if (resultado.data) {
        this.peliculasDestacadas.set(resultado.data.map(mapearPelicula));
      }
      this.cargando.set(false);
    });
  }

 

  
}