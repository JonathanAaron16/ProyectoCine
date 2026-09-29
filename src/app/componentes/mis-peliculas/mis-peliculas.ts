import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sesion } from '../../servicios/sesion';
import { Compras } from '../../servicios/compras';
import { Resenas } from '../../servicios/resenas';

@Component({
  selector: 'app-mis-peliculas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mis-peliculas.html',
  styleUrl: './mis-peliculas.css'
})
export class MisPeliculas implements OnInit {
  peliculasVistas = signal<any[]>([]);
  cargando = signal(true);

  constructor(
    public sesion: Sesion,
    private comprasService: Compras,
    private resenasService: Resenas
  ) {}

  async ngOnInit() {
    while (this.sesion.cargando()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const usuario = this.sesion.usuarioActual();
    if (!usuario) { this.cargando.set(false); return; }

    const [resultadoHistorial, resultadoResenas] = await Promise.all([
      this.comprasService.obtenerHistorialUsuario(usuario.id),
      this.resenasService.obtenerPorUsuario(usuario.id),
    ]);

    const resenasPorPelicula = new Map(
      (resultadoResenas.data ?? []).map((r: any) => [r.peliculaId, r.calificacion])
    );

    const vistasUnicas = new Map<number, any>();

    for (const fila of resultadoHistorial.data ?? []) {
      const pelicula = (fila as any).funciones?.peliculas;
      if (!pelicula) continue;

      if (!vistasUnicas.has(pelicula.id)) {
        vistasUnicas.set(pelicula.id, {
          id: pelicula.id,
          nombre: pelicula.nombre,
          imagen: pelicula.imagen,
          fecha: (fila as any).funciones.fecha,
          miCalificacion: resenasPorPelicula.get(pelicula.id) ?? null,
        });
      }
    }

    this.peliculasVistas.set([...vistasUnicas.values()]);
    this.cargando.set(false);
  }
}