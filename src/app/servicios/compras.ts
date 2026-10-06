import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Compras {

  // Obtiene una función junto con la información de su película y sala.
 async obtenerFuncionConSala(funcionId: number) {
  return supabase
    .from('funciones')
    .select('*, peliculas(nombre, duracionMinutos, clasificacionEdad, tienePreventa, precioPreventa, fechaEstreno), salas(id, nombre)')
    .eq('id', funcionId)
    .single();
}

  // Obtiene y ordena las butacas pertenecientes a una sala.
  async obtenerButacasDeSala(salaId: number) {
    return supabase.from('butacas').select('*').eq('salaId', salaId).order('fila').order('numero');
  }

  // Obtiene las butacas ocupadas para una función determinada.
  async obtenerButacasOcupadas(funcionId: number) {
  return supabase
    .from('entradas')
    .select('butacaId')
    .eq('funcionId', funcionId)
    .eq('activa', true);
}

obtenerOcupadasEnVivo(funcionId: number) {
  return new Observable<Set<number>>((observer) => {
    const emitirOcupadas = async () => {
      const { data, error } = await this.obtenerButacasOcupadas(funcionId);
      if (error) {
        observer.error(error);
        return;
      }
      observer.next(new Set((data ?? []).map((e: any) => e.butacaId)));
    };

    void emitirOcupadas();

    const canal = supabase
      .channel(`entradas-funcion-${funcionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entradas' },
        () => {
          void emitirOcupadas();
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          observer.error(new Error('No se pudo suscribir al canal realtime.'));
        }
      });

    return () => {
      void supabase.removeChannel(canal);
    };
  });
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
  creditoUtilizado: number;
}) {
  const codigoQr = crypto.randomUUID();
  const totalButacas = datos.butacas.reduce((acc, b) => acc + b.precio, 0);
  const totalProductos = datos.productos.reduce((acc, p) => acc + p.precioUnitario * p.cantidad, 0);
  const total = Math.max(totalButacas + totalProductos - datos.descuento - datos.creditoUtilizado, 0);

  const { data: compra, error: errorCompra } = await supabase
    .from('compras')
    .insert([{
      usuarioId: datos.usuarioId,
      total,
      codigoQr,
      estado: 'confirmada',
      cuponId: datos.cuponId,
      descuento: datos.descuento,
      creditoUtilizado: datos.creditoUtilizado,
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
    await supabase.rpc('revertir_compra', { compra_id: compra.id, codigo_qr: codigoQr });
    return { data: null, error: errorEntradas };
  }

  if (datos.creditoUtilizado > 0 && datos.usuarioId) {
    const { error: errorCredito } = await supabase.rpc('usar_credito', {
      usuario_id: datos.usuarioId,
      monto: datos.creditoUtilizado,
    });

    if (errorCredito) {
      await supabase.rpc('revertir_compra', { compra_id: compra.id, codigo_qr: codigoQr });
      return { data: null, error: { message: 'No se pudo aplicar el crédito' } };
    }
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

  if (datos.usuarioId) {
    await supabase.rpc('sumar_puntos', { usuario_id: datos.usuarioId, cantidad: Math.floor(total) });
  }

  return { data: compra, error: null };
}
  obtenerMisCompras(usuarioId: string) {
    return supabase
      .from('compras')
      .select('*, entradas(id, funciones(fecha, hora, peliculas(nombre)))')
      .eq('usuarioId', usuarioId)
      .order('fecha', { ascending: false });
  }

  async cancelarCompra(compraId: number, usuarioId: string): Promise<{ exito: boolean; error: string }> {
    const { error } = await supabase.rpc('cancelar_compra', { compra_id: compraId, usuario_id: usuarioId });

    if (error) {
      return {
        exito: false,
        error: error.message.includes('2 horas')
          ? 'Ya no se puede cancelar: faltan menos de 2 horas para la función'
          : 'No se pudo cancelar la compra',
      };
    }

    return { exito: true, error: '' };
  }



 async usuarioVioLaPelicula(usuarioId: string, peliculaId: number): Promise<boolean> {
  const resultado = await supabase
    .from('entradas')
    .select('id, funciones!inner(peliculaId), compras!inner(usuarioId)')
    .eq('funciones.peliculaId', peliculaId)
    .eq('compras.usuarioId', usuarioId)
    .eq('compras.estado', 'confirmada');

  

  return (resultado.data?.length ?? 0) > 0;
}
 obtenerHistorialUsuario(usuarioId: string) {
  return supabase
    .from('entradas')
    .select('funciones(fecha, peliculas(id, nombre, imagen)), compras!inner(usuarioId, fecha)')
    .eq('compras.usuarioId', usuarioId)
    .eq('compras.estado', 'confirmada');
}


}