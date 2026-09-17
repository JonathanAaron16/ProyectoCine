export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  disponible: boolean;
  esCombo: boolean;
  productosIncluidos?: number[];   // ids de productos si esCombo = true
}