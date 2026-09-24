import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class Compras {

  // Obtiene una función junto con la información de su película y sala.
  async obtenerFuncionConSala(funcionId: number) {
    return supabase
      .from('funciones')
      .select('*, peliculas(nombre, duracionMinutos, clasificacionEdad), salas(id, nombre)')
      .eq('id', funcionId)
      .single();
  }

  // Obtiene y ordena las butacas pertenecientes a una sala.
  async obtenerButacasDeSala(salaId: number) {
    return supabase.from('butacas').select('*').eq('salaId', salaId).order('fila').order('numero');
  }

  // Obtiene las butacas ocupadas para una función determinada.
  async obtenerButacasOcupadas(funcionId: number) {
    return supabase.from('entradas').select('butacaId').eq('funcionId', funcionId);
  }
}