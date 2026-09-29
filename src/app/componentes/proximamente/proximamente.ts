import { Component, OnInit, signal } from '@angular/core';
import { Pelicula, mapearPelicula } from '../../models/pelicula';
import { Peliculas } from '../../servicios/peliculas';
import { Alertas } from '../../servicios/alertas';
import { Sesion } from '../../servicios/sesion';

@Component({
  selector: 'app-proximamente',
  standalone: true,
  imports: [],
  templateUrl: './proximamente.html',
  styleUrl: './proximamente.css'
})
export class Proximamente implements OnInit {
  peliculas = signal<Pelicula[]>([]);
  misAlertas = signal<Set<number>>(new Set());
  cargando = signal(true);

  constructor(
    private peliculasService: Peliculas,
    private alertasService: Alertas,
    public sesion: Sesion
  ) {}

  async ngOnInit() {
    const resultado = await this.peliculasService.obtenerProximamente();
    if (resultado.data) this.peliculas.set(resultado.data.map(mapearPelicula));

    while (this.sesion.cargando()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const usuario = this.sesion.usuarioActual();
    if (usuario) {
      this.misAlertas.set(await this.alertasService.obtenerMisAlertas(usuario.id));
    }

    this.cargando.set(false);
  }

  async toggleAlerta(peliculaId: number) {
    const usuario = this.sesion.usuarioActual();
    if (!usuario) return;

    const actuales = new Set(this.misAlertas());

    if (actuales.has(peliculaId)) {
      await this.alertasService.desactivar(usuario.id, peliculaId);
      actuales.delete(peliculaId);
    } else {
      await this.alertasService.activar(usuario.id, peliculaId);
      actuales.add(peliculaId);
    }

    this.misAlertas.set(actuales);
  }
}