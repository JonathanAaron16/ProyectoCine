import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class LogActividad {

  registrar(usuarioId: string, accion: string, detalle: string) {
    return supabase.from('log_actividad').insert([{ usuarioId, accion, detalle }]);
  }

  obtenerTodo() {
    return supabase
      .from('log_actividad')
      .select('*, usuarios(nombre, apellido, rol)')
      .order('fecha', { ascending: false })
      .limit(200);
  }
}