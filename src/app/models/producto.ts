export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: number;   
  imagen: string;
  disponible: boolean;
  esCombo: boolean;
}

export interface CategoriaProducto {
  id: number;
  nombre: string;
}