import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Productos } from '../../../servicios/productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './productos.html',
  styleUrl: '../admin.css'
})
export class ProductosComponent implements OnInit {
  productos = signal<any[]>([]);
  cargando = signal(true);

  constructor(private productosService: Productos) {}

  ngOnInit() {
  this.productosService.obtenerTodos().then(resultado => {
 

    if (resultado.data) this.productos.set(resultado.data);
    this.cargando.set(false);
  });
}

  async eliminar(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    await this.productosService.eliminar(id);
    this.productos.set(this.productos().filter(p => p.id !== id));
  }
}