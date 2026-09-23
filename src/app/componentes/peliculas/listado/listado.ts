import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Pelicula, mapearPelicula } from '../../../models/pelicula';
import { Peliculas } from '../../../servicios/peliculas';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './listado.html',
  styleUrl: './listado.css'
})
export class Listado implements OnInit {
  peliculas = signal<Pelicula[]>([]);
  cargando = signal(true);

  textoBusqueda: string = '';
  generoSeleccionado: string = '';

  constructor(private peliculasService: Peliculas) {}

  ngOnInit() {
    this.peliculasService.obtenerTodas().then(resultado => {
      console.log('Resultado completo:', resultado); 
      if (resultado.data) {
        this.peliculas.set(resultado.data.map(mapearPelicula));
      }
      this.cargando.set(false);
    });
  }

  get generosDisponibles(): string[] {
    const todos = this.peliculas().flatMap(p => p.generos);
    return [...new Set(todos)];
  }

  get peliculasFiltradas(): Pelicula[] {
    return this.peliculas().filter(p => {
      const coincideNombre = p.nombre
        .toLowerCase()
        .includes(this.textoBusqueda.toLowerCase());

      const coincideGenero = this.generoSeleccionado
        ? p.generos.includes(this.generoSeleccionado)
        : true;

      return p.publicada && coincideNombre && coincideGenero;
    });
  }
}