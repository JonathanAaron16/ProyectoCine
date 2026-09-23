import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Pelicula } from '../models/pelicula';

@Injectable({ providedIn: 'root' })
export class Peliculas {

  obtenerTodas() {
    return supabase
      .from('peliculas')
      .select('*, peliculas_generos(generos(id, nombre))')
      .order('id');
  }

  obtenerPorId(id: number) {
    return supabase
      .from('peliculas')
      .select('*, peliculas_generos(generos(id, nombre))')
      .eq('id', id)
      .single();
  }
  
  obtenerDestacadas() {
  return supabase
    .from('peliculas')
    .select('*, peliculas_generos(generos(id, nombre))')
    .eq('destacada', true)
    .eq('publicada', true);
}

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

  actualizar(id: number, pelicula: Partial<Omit<Pelicula, 'id' | 'generos'>>) {
    return supabase
      .from('peliculas')
      .update(pelicula)
      .eq('id', id);
  }

  eliminar(id: number) {
    return supabase
      .from('peliculas')
      .delete()
      .eq('id', id);
  }
}