import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pelicula, mapearPelicula } from '../../models/pelicula';
import { Peliculas } from '../../servicios/peliculas';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  peliculas = signal<Pelicula[]>([]);
  cargando = signal(true);

  constructor(private peliculasService: Peliculas) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.peliculasService.obtenerTodas().then(resultado => {
      if (resultado.data) {
        this.peliculas.set(resultado.data.map(mapearPelicula));
      }
      this.cargando.set(false);
    });
  }

  async eliminar(id: number) {
    if (!confirm('¿Seguro que querés eliminar esta película?')) return;

    await this.peliculasService.eliminar(id);
    this.cargar();
  }
}