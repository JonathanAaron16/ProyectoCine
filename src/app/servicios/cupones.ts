import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Cupon } from '../models/cupon';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Cupones {

  obtenerTodos() {
    return supabase.from('cupones').select('*').order('codigo');
  }

  crear(cupon: Omit<Cupon, 'id'>) {
    return supabase.from('cupones').insert([cupon]);
  }

  actualizar(id: number, cambios: Partial<Omit<Cupon, 'id'>>) {
    return supabase.from('cupones').update(cambios).eq('id', id);
  }

  eliminar(id: number) {
    return supabase.from('cupones').delete().eq('id', id);
  }

  async validar(codigo: string, usuario: Usuario | null): Promise<{ cupon: Cupon | null; error: string }> {
    const { data: cupon } = await supabase
      .from('cupones')
      .select('*')
      .eq('codigo', codigo.trim().toUpperCase())
      .maybeSingle();

    if (!cupon) return { cupon: null, error: 'El cupón no existe' };
    if (!cupon.activo) return { cupon: null, error: 'El cupón no está activo' };

    if (cupon.fechaVencimiento && new Date(cupon.fechaVencimiento) < new Date()) {
      return { cupon: null, error: 'El cupón está vencido' };
    }

    if (cupon.tipo !== 'general' && !usuario) {
      return { cupon: null, error: 'Iniciá sesión para usar este cupón' };
    }

    if (cupon.tipo === 'mayores50' && usuario) {
      const nacimiento = new Date(usuario.fechaNacimiento);
      const edad = (Date.now() - nacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (edad < 50) return { cupon: null, error: 'Este cupón es solo para mayores de 50 años' };
    }

    if (cupon.tipo === 'primeraCompra' && usuario) {
      const { count } = await supabase
        .from('compras')
        .select('id', { count: 'exact', head: true })
        .eq('usuarioId', usuario.id)
        .eq('estado', 'confirmada');

      if ((count ?? 0) > 0) return { cupon: null, error: 'Este cupón es solo para tu primera compra' };
    }

    if (cupon.usoUnico && usuario) {
      const { count } = await supabase
        .from('cupones_usados')
        .select('id', { count: 'exact', head: true })
        .eq('cuponId', cupon.id)
        .eq('usuarioId', usuario.id);

      if ((count ?? 0) > 0) return { cupon: null, error: 'Ya usaste este cupón' };
    }

    return { cupon: cupon as Cupon, error: '' };
  }

  async buscarCuponBienvenida(usuario: Usuario): Promise<Cupon | null> {
    const { data } = await supabase
      .from('cupones')
      .select('codigo')
      .eq('tipo', 'primeraCompra')
      .eq('activo', true)
      .limit(1);

    if (!data || data.length === 0) return null;

    const { cupon } = await this.validar(data[0].codigo, usuario);
    return cupon;
  }
}