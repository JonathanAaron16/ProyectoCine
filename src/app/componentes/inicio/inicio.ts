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
  peliculasDestacadas = signal<Pelicula[]>([]);
  cargando = signal(true);

  textoBusqueda: string = '';
  generoSeleccionado: string = '';

  // Inicializa el servicio utilizado para cargar las películas destacadas.
  constructor(private peliculasService: Peliculas) {}

  // Carga las películas destacadas cuando se inicia la página principal.
  ngOnInit() {
    this.peliculasService.obtenerDestacadas().then(resultado => {
      if (resultado.data) {
        this.peliculasDestacadas.set(resultado.data.map(mapearPelicula));
      }
      this.cargando.set(false);
    });
  }

 

  
}