import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { LogActividad } from './log-actividad';

@Injectable({ providedIn: 'root' })
export class Validacion {

  constructor(private logService: LogActividad) {}

  async buscarCompraPorQr(codigo: string) {
    const { data: compra, error } = await supabase
      .from('compras')
      .select('*')
      .eq('codigoQr', codigo.trim())
      .maybeSingle();

    if (error || !compra) {
      return { compra: null, entradas: [], productos: [], error: 'No se encontró ninguna compra con ese código' };
    }

    const [resultadoEntradas, resultadoProductos] = await Promise.all([
      supabase
        .from('entradas')
        .select('*, funciones(fecha, hora, peliculas(nombre)), butacas(fila, numero, tipo)')
        .eq('compraId', compra.id),
      supabase
        .from('productos_comprados')
        .select('*, productos(nombre)')
        .eq('compraId', compra.id),
    ]);

    return {
      compra,
      entradas: resultadoEntradas.data ?? [],
      productos: resultadoProductos.data ?? [],
      error: '',
    };
  }

  async validarEntrada(entradaId: number, empleadoId: string) {
    const { data, error } = await supabase
      .from('entradas')
      .update({ validada: true, fechaValidacion: new Date().toISOString(), empleadoValidadorId: empleadoId })
      .eq('id', entradaId)
      .eq('validada', false)
      .select();

    if (error) return { exito: false, error: 'No se pudo validar la entrada' };
    if (!data || data.length === 0) return { exito: false, error: 'Esta entrada ya fue validada antes' };

    await this.logService.registrar(empleadoId, 'Validó código QR', `Entrada #${entradaId}`);

    return { exito: true, error: '' };
  }

  async validarProducto(productoCompradoId: number, empleadoId: string) {
    const { data, error } = await supabase
      .from('productos_comprados')
      .update({ retirado: true, fechaRetiro: new Date().toISOString(), empleadoRetiroId: empleadoId })
      .eq('id', productoCompradoId)
      .eq('retirado', false)
      .select();

    if (error) return { exito: false, error: 'No se pudo validar el producto' };
    if (!data || data.length === 0) return { exito: false, error: 'Este producto ya fue retirado antes' };

    await this.logService.registrar(empleadoId, 'Validó código QR (producto)', `Producto comprado #${productoCompradoId}`);

    return { exito: true, error: '' };
  }
}