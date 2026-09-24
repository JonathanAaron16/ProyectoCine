import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Funcion } from '../models/funcion';

const BUFFER_MINUTOS = 30;

// Convierte una fecha y una hora en un objeto Date.
function horaAFecha(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}`);
}

// Suma una cantidad de minutos a una fecha.
function sumarMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60000);
}

@Injectable({ providedIn: 'root' })
export class Funciones {

  // Obtiene todas las funciones junto con sus películas y salas.
  obtenerTodas() {
    return supabase
      .from('funciones')
      .select('*, peliculas(nombre, duracionMinutos), salas(nombre)')
      .order('fecha')
      .order('hora');
  }

  // Busca una sala disponible y crea una nueva función.
  async crear(datos: Omit<Funcion, 'id' | 'salaId'>, duracionMinutos: number) {
    const salaId = await this.buscarSalaDisponible(datos.fecha, datos.hora, duracionMinutos);

    if (salaId === null) {
      return { data: null, error: { message: 'No hay salas disponibles en ese horario' } };
    }

    return supabase.from('funciones').insert([{ ...datos, salaId }]).select().single();
  }

  // Elimina una función por su id.
  eliminar(id: number) {
    return supabase.from('funciones').delete().eq('id', id);
  }

  // Busca una sala cuyo horario no se superponga con otra función.
  private async buscarSalaDisponible(fecha: string, hora: string, duracionMinutos: number): Promise<number | null> {
    const { data: salas } = await supabase.from('salas').select('id');
    if (!salas || salas.length === 0) return null;

    const { data: funcionesDelDia } = await supabase
      .from('funciones')
      .select('salaId, hora, peliculas(duracionMinutos)')
      .eq('fecha', fecha);

    const nuevoInicio = horaAFecha(fecha, hora);
    const nuevoFin = sumarMinutos(nuevoInicio, duracionMinutos);

    for (const sala of salas) {
      const funcionesEnSala = (funcionesDelDia ?? []).filter((f: any) => f.salaId === sala.id);

      const hayConflicto = funcionesEnSala.some((f: any) => {
        const inicioExistente = horaAFecha(fecha, f.hora);
        const duracionExistente = f.peliculas?.duracionMinutos ?? 0;
        const finExistente = sumarMinutos(inicioExistente, duracionExistente);
        const finExistenteConBuffer = sumarMinutos(finExistente, BUFFER_MINUTOS);
        const finNuevoConBuffer = sumarMinutos(nuevoFin, BUFFER_MINUTOS);

        return nuevoInicio < finExistenteConBuffer && inicioExistente < finNuevoConBuffer;
      });

      if (!hayConflicto) return sala.id;
    }

    return null;
  }
}