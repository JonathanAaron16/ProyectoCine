import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class Recompensas {

  obtenerDisponibles() {
    return supabase.from('recompensas').select('*, productos(nombre)').eq('activo', true).order('puntosNecesarios');
  }

  obtenerTodas() {
    return supabase.from('recompensas').select('*, productos(nombre)').order('puntosNecesarios');
  }

  crear(recompensa: { nombre: string; descripcion: string; puntosNecesarios: number; tipo: 'entrada' | 'producto'; productoId: number | null; activo: boolean }) {
    return supabase.from('recompensas').insert([recompensa]);
  }

  actualizar(id: number, cambios: Partial<{ nombre: string; descripcion: string; puntosNecesarios: number; activo: boolean }>) {
    return supabase.from('recompensas').update(cambios).eq('id', id);
  }

  eliminar(id: number) {
    return supabase.from('recompensas').delete().eq('id', id);
  }

  async canjear(usuarioId: string, recompensaId: number): Promise<{ codigo: string | null; error: string }> {
    const { data, error } = await supabase.rpc('canjear_recompensa', {
      usuario_id: usuarioId,
      recompensa_id: recompensaId,
    });

    if (error) {
      return {
        codigo: null,
        error: error.message.includes('insuficientes') ? 'No tenés puntos suficientes' : 'No se pudo canjear la recompensa',
      };
    }

    return { codigo: data as string, error: '' };
  }

  obtenerHistorialCanjes(usuarioId: string) {
    return supabase
      .from('canjes')
      .select('*, recompensas(nombre)')
      .eq('usuarioId', usuarioId)
      .order('fecha', { ascending: false });
  }
}