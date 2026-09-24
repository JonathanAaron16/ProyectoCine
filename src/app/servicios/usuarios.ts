import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Usuarios {
  // Crea el perfil asociado a una cuenta de usuario.
  crearPerfil(perfil: Omit<Usuario, 'puntos' | 'credito'>) {
    return supabase.from('usuarios').insert([perfil]);
  }

  // Obtiene un perfil por su id o devuelve null si no existe.
  async obtenerPerfil(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return data as Usuario;
  }
}