import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Pelicula } from '../models/pelicula';

@Injectable({ providedIn: 'root' })
export class Peliculas {

  // Obtiene todas las películas con sus géneros relacionados.
  obtenerTodas() {
    return supabase
      .from('peliculas')
      .select('*, peliculas_generos(generos(id, nombre))')
      .order('id');
  }

  // Obtiene una película específica junto con sus géneros.
  obtenerPorId(id: number) {
    return supabase
      .from('peliculas')
      .select('*, peliculas_generos(generos(id, nombre))')
      .eq('id', id)
      .single();
  }
  
  // Obtiene las películas destacadas que están publicadas.
  obtenerDestacadas() {
  return supabase
    .from('peliculas')
    .select('*, peliculas_generos(generos(id, nombre))')
    .eq('destacada', true)
    .eq('publicada', true);
}

  // Crea una película y registra sus relaciones con los géneros.
  crear(pelicula: Omit<Pelicula, 'id' | 'generos'>, generoIds: number[]) {
    return supabase
      .from('peliculas')
      .insert([pelicula])
      .select()
      .single()
      .then(async (resultado) => {
        if (resultado.error || !resultado.data) return resultado;

        const relaciones = generoIds.map(generoId => ({
          pelicula_id: resultado.data.id,
          genero_id: generoId,
        }));

        if (relaciones.length > 0) {
          await supabase.from('peliculas_generos').insert(relaciones);
        }

        return resultado;
      });
  }

  // Actualiza los datos de una película existente.
  actualizar(id: number, pelicula: Partial<Omit<Pelicula, 'id' | 'generos'>>) {
    return supabase
      .from('peliculas')
      .update(pelicula)
      .eq('id', id);
  }

  // Elimina una película por su id.
  eliminar(id: number) {
    return supabase
      .from('peliculas')
      .delete()
      .eq('id', id);
  }
}