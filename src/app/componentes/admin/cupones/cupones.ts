import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cupones } from '../../../servicios/cupones';
import { Cupon } from '../../../models/cupon';

@Component({
  selector: 'app-cupones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cupones.html',
  styleUrl: '../admin.css'
})
export class CuponesComponent implements OnInit {
  cupones = signal<Cupon[]>([]);
  cargando = signal(true);

  constructor(private cuponesService: Cupones) {}

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    const resultado = await this.cuponesService.obtenerTodos();
    if (resultado.data) this.cupones.set(resultado.data);
    this.cargando.set(false);
  }

  async guardarPorcentaje(id: number, valor: number) {
    if (!valor || valor < 1 || valor > 100) {
      alert('El porcentaje tiene que estar entre 1 y 100');
      return;
    }
    await this.cuponesService.actualizar(id, { porcentajeDescuento: valor });
    await this.cargar();
  }

  async alternarActivo(cupon: Cupon) {
    await this.cuponesService.actualizar(cupon.id, { activo: !cupon.activo });
    await this.cargar();
  }

  async eliminar(id: number) {
    if (!confirm('¿Eliminar este cupón?')) return;
    await this.cuponesService.eliminar(id);
    await this.cargar();
  }
}