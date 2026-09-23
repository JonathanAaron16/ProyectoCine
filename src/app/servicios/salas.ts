import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Sala } from '../models/sala';
import { Butaca } from '../models/butaca';


const COLUMNAS_COMUNES = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30];
const COLUMNAS_ACCESIBLES = [2, 3, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 28, 29];



interface FilaConfig {
  fila: string;
  tipo: 'comun' | 'accesible' | 'vip';
  columnas: number[];
}

const DISTRIBUCION: FilaConfig[] = [
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(f => ({ fila: f, tipo: 'comun' as const, columnas: COLUMNAS_COMUNES })),
  { fila: 'J', tipo: 'accesible' as const, columnas: COLUMNAS_ACCESIBLES },
  ...['L', 'M', 'N', 'O', 'P', 'Q'].map(f => ({ fila: f, tipo: 'comun' as const, columnas: COLUMNAS_COMUNES })),
  ...['R', 'S', 'T'].map(f => ({ fila: f, tipo: 'vip' as const, columnas: COLUMNAS_COMUNES })),
]

function generarButacas(salaId: number): Omit<Butaca, 'id'>[] {
  const butacas: Omit<Butaca, 'id'>[] = [];

  for (const config of DISTRIBUCION) {
    for (const numero of config.columnas) {
      butacas.push({
        salaId,
        fila: config.fila,
        numero,
        tipo: config.tipo,
      });
    }
  }

  return butacas;
}

function capacidadTotal(): number {
  return DISTRIBUCION.reduce((total, config) => total + config.columnas.length, 0);
}

@Injectable({ providedIn: 'root' })
export class Salas {

  async crearConButacas(nombre: string) {
    const { data: sala, error: errorSala } = await supabase
      .from('salas')
      .insert([{ nombre, capacidad: capacidadTotal() }])
      .select()
      .single();

    if (errorSala || !sala) {
      return { data: null, error: errorSala };
    }

    const butacas = generarButacas(sala.id);
    const { error: errorButacas } = await supabase.from('butacas').insert(butacas);

    if (errorButacas) {
      // Si falla la carga de butacas, no dejamos la sala "a medias"
      await supabase.from('salas').delete().eq('id', sala.id);
      return { data: null, error: errorButacas };
    }

    return { data: sala, error: null };
  }

  obtenerTodas() {
    return supabase.from('salas').select('*').order('nombre');
  }

  obtenerButacas(salaId: number) {
    return supabase
      .from('butacas')
      .select('*')
      .eq('salaId', salaId)
      .order('fila')
      .order('numero');
  }
}