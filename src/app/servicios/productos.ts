import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class Productos {

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

  actualizar(id: number, producto: Partial<Omit<Producto, 'id'>>) {
    return supabase.from('productos').update(producto).eq('id', id);
  }

  eliminar(id: number) {
    return supabase.from('productos').delete().eq('id', id);
  }
}