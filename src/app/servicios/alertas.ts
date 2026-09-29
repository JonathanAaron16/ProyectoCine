import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class Alertas {

  async obtenerMisAlertas(usuarioId: string): Promise<Set<number>> {
    const { data } = await supabase.from('alertas_estreno').select('peliculaId').eq('usuarioId', usuarioId);
    return new Set((data ?? []).map(a => a.peliculaId));
  }

  activar(usuarioId: string, peliculaId: number) {
    return supabase.from('alertas_estreno').insert([{ usuarioId, peliculaId }]);
  }

  desactivar(usuarioId: string, peliculaId: number) {
    return supabase.from('alertas_estreno').delete().eq('usuarioId', usuarioId).eq('peliculaId', peliculaId);
  }
}