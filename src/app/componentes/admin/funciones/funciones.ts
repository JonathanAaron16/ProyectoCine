import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Funciones } from '../../../servicios/funciones';

@Component({
  selector: 'app-funciones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './funciones.html',
  styleUrl: './funciones.css'
})
export class FuncionesComponent implements OnInit {
  funciones = signal<any[]>([]);
  cargando = signal(true);

  constructor(private funcionesService: Funciones) {}

  ngOnInit() {
    this.funcionesService.obtenerTodas().then(resultado => {
      if (resultado.data) this.funciones.set(resultado.data);
      this.cargando.set(false);
    });
  }

  async eliminar(id: number) {
    if (!confirm('¿Eliminar esta función?')) return;
    await this.funcionesService.eliminar(id);
    this.funciones.set(this.funciones().filter(f => f.id !== id));
  }
}