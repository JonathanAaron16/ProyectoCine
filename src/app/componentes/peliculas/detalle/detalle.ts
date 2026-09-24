import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Pelicula, mapearPelicula } from '../../../models/pelicula';
import { Resena } from '../../../models/resena';
import { Peliculas } from '../../../servicios/peliculas';
import { Resenas } from '../../../servicios/resenas';
import { DatePipe } from '@angular/common';
import { supabase } from '../../../servicios/supabase-client';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [RouterLink,DatePipe],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css'
})
export class Detalle {
  pelicula = signal<Pelicula | undefined>(undefined);
  resenas = signal<Resena[]>([]);
  cargando = signal(true);
  funciones = signal<any[]>([]);
  
  mostrarModal = signal(false);

  // Inicializa los servicios y carga la película indicada en la ruta.
  constructor(
    private route: ActivatedRoute,
    private peliculasService: Peliculas,
    private resenasService: Resenas
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatos(id);
  }

    
    // irAFunciones() {
    //   document.getElementById('funciones-disponibles')?.scrollIntoView({ behavior: 'smooth' });
    // }

    // Obtiene en paralelo los datos de la película, sus reseñas y sus funciones.
  private async cargarDatos(id: number) {
    const [resultadoPelicula, resultadoResenas, resultadoFunciones] = await Promise.all([
    this.peliculasService.obtenerPorId(id),
    this.resenasService.obtenerPorPelicula(id),
    supabase.from('funciones').select('*').eq('peliculaId', id).order('fecha').order('hora')
  ]);

  if (resultadoPelicula.data) this.pelicula.set(mapearPelicula(resultadoPelicula.data));
  if (resultadoResenas.data) this.resenas.set(resultadoResenas.data);
  if (resultadoFunciones.data) this.funciones.set(resultadoFunciones.data);

  this.cargando.set(false);
  }

  // Calcula el promedio de calificación de las reseñas de la película.
  get promedioCalificacion(): number {
    const lista = this.resenas();
    if (lista.length === 0) return 0;
    const suma = lista.reduce((acc, r) => acc + r.calificacion, 0);
    return Math.round((suma / lista.length) * 10) / 10;
  }
}