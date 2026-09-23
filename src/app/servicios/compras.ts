import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class Compras {

  async obtenerFuncionConSala(funcionId: number) {
    return supabase
      .from('funciones')
      .select('*, peliculas(nombre, duracionMinutos, clasificacionEdad), salas(id, nombre)')
      .eq('id', funcionId)
      .single();
  }

  async obtenerButacasDeSala(salaId: number) {
    return supabase.from('butacas').select('*').eq('salaId', salaId).order('fila').order('numero');
  }

  async obtenerButacasOcupadas(funcionId: number) {
    return supabase.from('entradas').select('butacaId').eq('funcionId', funcionId);
  }
}