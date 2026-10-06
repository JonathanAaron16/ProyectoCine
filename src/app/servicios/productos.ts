import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Producto } from '../models/producto';

import { LogActividad } from './log-actividad';
import { Sesion } from './sesion';

@Injectable({ providedIn: 'root' })
export class Productos {

  constructor(private logService: LogActividad, private sesion: Sesion) {}

  obtenerCategorias() {
    return supabase.from('categorias_productos').select('*').order('nombre');
  }

  crearCategoria(nombre: string) {
    return supabase.from('categorias_productos').insert([{ nombre }]);
  }

  // obtenerTodos() {
  //   return supabase
  //     .from('productos')
  //     .select('*, categorias_productos(nombre), productos_combo(productoId, cantidad, productos!productos_combo_productoId_fkey(nombre))')
  //     .order('nombre');
  // }
  obtenerTodos() {
  return supabase
    .from('productos')
    .select('*, categorias_productos(nombre)')
    .order('nombre');
}

  obtenerDisponibles() {
    return supabase
      .from('productos')
      .select('*, categorias_productos(nombre)')
      .eq('disponible', true)
      .order('categoriaId');
  }

  async crear(producto: Omit<Producto, 'id'>, productosDelCombo: { productoId: number; cantidad: number }[]) {
    const { data, error } = await supabase.from('productos').insert([producto]).select().single();

    if (error || !data) return { data: null, error };

    if (producto.esCombo && productosDelCombo.length > 0) {
      const relaciones = productosDelCombo.map(p => ({
        comboId: data.id,
        productoId: p.productoId,
        cantidad: p.cantidad,
      }));
      await supabase.from('productos_combo').insert(relaciones);
    }

    return { data, error: null };
  }

  async actualizar(id: number, producto: Partial<Omit<Producto, 'id'>>) {
    let precioAnterior: number | null = null;

    if (producto.precio !== undefined) {
      const { data } = await supabase.from('productos').select('precio').eq('id', id).single();
      precioAnterior = data ? Number(data.precio) : null;
    }

    const resultado = await supabase.from('productos').update(producto).eq('id', id);

    if (!resultado.error && producto.precio !== undefined && precioAnterior !== Number(producto.precio)) {
      const usuarioId = this.sesion.usuarioActual()?.id;
      if (usuarioId) {
        await this.logService.registrar(
          usuarioId,
          'Modificó precio',
          `Producto #${id}: $${precioAnterior} → $${producto.precio}`
        );
      }
    }

    return resultado;
  }

  obtenerPorId(id: number) {
    return supabase.from('productos').select('*').eq('id', id).single();
  }

  obtenerItemsCombo(comboId: number) {
    return supabase.from('productos_combo').select('productoId, cantidad').eq('comboId', comboId);
  }

  async reemplazarItemsCombo(comboId: number, items: { productoId: number; cantidad: number }[]) {
    await supabase.from('productos_combo').delete().eq('comboId', comboId);

    if (items.length === 0) return { error: null };

    return supabase
      .from('productos_combo')
      .insert(items.map(i => ({ comboId, productoId: i.productoId, cantidad: i.cantidad })));
  }

  eliminar(id: number) {
    return supabase.from('productos').delete().eq('id', id);
  }
}