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
  //Si el insert de entradas falla (porque otra persona ganó la butaca por una fracción de segundo gracias al
  //  unique("funcionId","butacaId") se borra la compra huérfana y devolvemos el error para avisarle al usuario
  async confirmarCompra(datos: {
  usuarioId: string | null;
  funcionId: number;
  butacas: { id: number; precio: number }[];
  productos: { productoId: number; cantidad: number; precioUnitario: number }[];
  cuponId: number | null;
  descuento: number;
}) {
  const codigoQr = crypto.randomUUID();
  const totalButacas = datos.butacas.reduce((acc, b) => acc + b.precio, 0);
  const totalProductos = datos.productos.reduce((acc, p) => acc + p.precioUnitario * p.cantidad, 0);
  const total = Math.max(totalButacas + totalProductos - datos.descuento, 0);

  const { data: compra, error: errorCompra } = await supabase
    .from('compras')
    .insert([{
      usuarioId: datos.usuarioId,
      total,
      codigoQr,
      estado: 'confirmada',
      cuponId: datos.cuponId,
      descuento: datos.descuento,
    }])
    .select()
    .single();

  if (errorCompra || !compra) {
    return { data: null, error: errorCompra };
  }

  const entradas = datos.butacas.map(b => ({
    compraId: compra.id,
    funcionId: datos.funcionId,
    butacaId: b.id,
    precio: b.precio,
  }));

  const { error: errorEntradas } = await supabase.from('entradas').insert(entradas);

  if (errorEntradas) {
    await supabase.from('compras').delete().eq('id', compra.id);
    return { data: null, error: errorEntradas };
  }

  if (datos.productos.length > 0) {
    const productosComprados = datos.productos.map(p => ({
      compraId: compra.id,
      productoId: p.productoId,
      cantidad: p.cantidad,
      precioUnitario: p.precioUnitario,
    }));
    await supabase.from('productos_comprados').insert(productosComprados);
  }

  if (datos.cuponId && datos.usuarioId) {
    await supabase.from('cupones_usados').insert([{
      cuponId: datos.cuponId,
      usuarioId: datos.usuarioId,
      compraId: compra.id,
    }]);
  }

  return { data: compra, error: null };
}

}