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

  // Inicializa el servicio utilizado para administrar las películas.
  constructor(private peliculasService: Peliculas) {}

  // Carga las películas cuando se inicia el componente.
  ngOnInit() {
    this.cargar();
  }

  // Obtiene y muestra todas las películas disponibles para administrar.
  cargar() {
    this.cargando.set(true);
    this.peliculasService.obtenerTodas().then(resultado => {
      if (resultado.data) {
        this.peliculas.set(resultado.data.map(mapearPelicula));
      }
      this.cargando.set(false);
    });
  }

  // Elimina una película después de solicitar confirmación al usuario.
  async eliminar(id: number) {
    if (!confirm('¿Seguro que querés eliminar esta película?')) return;

    await this.peliculasService.eliminar(id);
    this.cargar();
  }
}