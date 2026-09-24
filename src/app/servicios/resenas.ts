import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Resena } from '../models/resena';

@Injectable({ providedIn: 'root' })
export class Resenas {

  // Obtiene las reseñas de una película ordenadas desde la más reciente.
  obtenerPorPelicula(peliculaId: number) {
    return supabase
      .from('resenas')
      .select('*')
      .eq('peliculaId', peliculaId)
      .order('fecha', { ascending: false });
  }

  // Guarda una nueva reseña en la base de datos.
  crear(resena: Omit<Resena, 'id' | 'fecha'>) {
    return supabase.from('resenas').insert([resena]);
  }
}