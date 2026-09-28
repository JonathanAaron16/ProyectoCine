export interface Cupon {
  id: number;
  codigo: string;
  porcentajeDescuento: number;
  tipo: 'primeraCompra' | 'mayores50' | 'general';
  activo: boolean;
  fechaVencimiento?: string | null;
  usoUnico: boolean;
}