export interface ProductoComprado {
  id: number;
  compraId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  retirado: boolean;
}