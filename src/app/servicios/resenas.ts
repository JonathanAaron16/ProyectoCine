import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Resena } from '../models/resena';

@Injectable({ providedIn: 'root' })
export class Resenas {

  obtenerPorPelicula(peliculaId: number) {
    return supabase
      .from('resenas')
      .select('*')
      .eq('peliculaId', peliculaId)
      .order('fecha', { ascending: false });
  }

  crear(resena: Omit<Resena, 'id' | 'fecha'>) {
    return supabase.from('resenas').insert([resena]);
  }
}