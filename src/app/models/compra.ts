// models/compra.ts
export interface Compra {
  id: number;
  usuarioId: number | null;       // null = cliente anónimo
  fecha: string;
  entradas: Entrada[];
  productos: ProductoComprado[];
  cuponAplicado?: string;
  creditoUtilizado?: number;
  total: number;
  codigoQr: string;                // único por compra
  estado: 'confirmada' | 'cancelada';
}

export interface Entrada {
  id: number;
   compraId: number;
  funcionId: number;
  butacaId: number;
  precio: number;
  validada: boolean;               // se valida individualmente al ingresar
  fechaValidacion?: string;
  empleadoValidadorId?: number;
}

export interface ProductoComprado {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  retirado: boolean;               // se retira individualmente en el Candy Bar
}