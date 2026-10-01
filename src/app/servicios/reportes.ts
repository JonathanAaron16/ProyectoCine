import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class Reportes {

  async obtenerVentasEnRango(fechaInicio: string, fechaFin: string) {
    const { data } = await supabase
      .from('compras')
      .select('total, fecha')
      .eq('estado', 'confirmada')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin + 'T23:59:59');

    return data ?? [];
  }

  async obtenerEntradasEnRango(fechaInicio: string, fechaFin: string) {
    const { data } = await supabase
      .from('entradas')
      .select('id, compras!inner(fecha, estado)')
      .eq('compras.estado', 'confirmada')
      .gte('compras.fecha', fechaInicio)
      .lte('compras.fecha', fechaFin + 'T23:59:59');

    return data ?? [];
  }

  async obtenerPeliculasMasVistas(fechaInicio: string, fechaFin: string) {
    const { data } = await supabase
      .from('entradas')
      .select('funciones(peliculas(id, nombre)), compras!inner(fecha, estado)')
      .eq('compras.estado', 'confirmada')
      .gte('compras.fecha', fechaInicio)
      .lte('compras.fecha', fechaFin + 'T23:59:59');

    const conteo = new Map<number, { nombre: string; cantidad: number }>();

    for (const fila of data ?? []) {
      const pelicula = (fila as any).funciones?.peliculas;
      if (!pelicula) continue;

      const actual = conteo.get(pelicula.id) ?? { nombre: pelicula.nombre, cantidad: 0 };
      actual.cantidad++;
      conteo.set(pelicula.id, actual);
    }

    return [...conteo.values()].sort((a, b) => b.cantidad - a.cantidad);
  }

  async obtenerProductoMasVendido(fechaInicio: string, fechaFin: string) {
    const { data } = await supabase
      .from('productos_comprados')
      .select('cantidad, productos(id, nombre), compras!inner(fecha, estado)')
      .eq('compras.estado', 'confirmada')
      .gte('compras.fecha', fechaInicio)
      .lte('compras.fecha', fechaFin + 'T23:59:59');

    const conteo = new Map<number, { nombre: string; cantidad: number }>();

    for (const fila of data ?? []) {
      const producto = (fila as any).productos;
      if (!producto) continue;

      const actual = conteo.get(producto.id) ?? { nombre: producto.nombre, cantidad: 0 };
      actual.cantidad += (fila as any).cantidad;
      conteo.set(producto.id, actual);
    }

    return [...conteo.values()].sort((a, b) => b.cantidad - a.cantidad);
  }
}