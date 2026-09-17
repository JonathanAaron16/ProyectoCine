export interface Butaca {
  id: number;
  salaId: number;
  fila: string;
  numero: number;
  tipo: 'comun' | 'accesible' | 'vip';
}