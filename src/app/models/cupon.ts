export interface Cupon {
  id: number;
  codigo: string;
  porcentajeDescuento: number;
  tipo: 'primeraCompra' | 'mayoresDe50' | 'general';
  activo: boolean;
  fechaVencimiento?: string;
}