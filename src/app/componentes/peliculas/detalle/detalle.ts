import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Pelicula, mapearPelicula } from '../../../models/pelicula';
import { Resena } from '../../../models/resena';
import { Peliculas } from '../../../servicios/peliculas';
import { Resenas } from '../../../servicios/resenas';
import { DatePipe } from '@angular/common';
import { supabase } from '../../../servicios/supabase-client';
import { form, FormField, required, min, max } from '@angular/forms/signals';
import { Sesion } from '../../../servicios/sesion';
import { Compras } from '../../../servicios/compras';
import { ErroresCampo } from '../../errores-campo/errores-campo';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [RouterLink,DatePipe,FormField,ErroresCampo],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css'
})
export class Detalle {
  pelicula = signal<Pelicula | undefined>(undefined);
  resenas = signal<Resena[]>([]);
  cargando = signal(true);
  funciones = signal<any[]>([]);
  
  mostrarModal = signal(false);

  calificacionModel = signal({ calificacion: '5', comentario: '' });

 

  calificacionForm = form(this.calificacionModel, (schemaPath) => {
    required(schemaPath.calificacion, { message: 'Elegí una calificación' });

    required(schemaPath.comentario, { message: 'Escribí un comentario' });
  });

  enviandoResena = signal(false);
  errorResena = signal(''); 

   puedeCalificar = signal(false);

  // Inicializa los servicios y carga la película indicada en la ruta.
  constructor(
    private route: ActivatedRoute,
    private peliculasService: Peliculas,
    private resenasService: Resenas,
    private comprasService: Compras, 
    public sesion: Sesion 
  ) {
    // Lee el parámetro 'id' de la URL, por ejemplo: /peliculas/12.
    // paramMap.get('id') devuelve un string, así que lo convertimos a number
    // para poder buscar la película correctamente en la base de datos.
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatos(id);
  }
  async enviarResena() {
    const usuario = this.sesion.usuarioActual();
    if (!usuario) return;

    this.enviandoResena.set(true);
    this.errorResena.set('');

    const datos = this.calificacionModel();
    const peliculaId = this.pelicula()!.id;

    const resultado = await this.resenasService.crear({
      peliculaId,
      usuarioId: usuario.id,
      calificacion: Number(datos.calificacion),
      comentario: datos.comentario,
    });

    this.enviandoResena.set(false);

    if (resultado.error) {
      this.errorResena.set('No se pudo publicar la reseña');
      return;
    }

    const resultadoResenas = await this.resenasService.obtenerPorPelicula(peliculaId);
    if (resultadoResenas.data) this.resenas.set(resultadoResenas.data);

    this.calificacionModel.set({ calificacion: '5', comentario: '' });
  }
  
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

  while (this.sesion.cargando()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const usuario = this.sesion.usuarioActual();
  if (usuario) {
    this.puedeCalificar.set(await this.comprasService.usuarioVioLaPelicula(usuario.id, id));
  }

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