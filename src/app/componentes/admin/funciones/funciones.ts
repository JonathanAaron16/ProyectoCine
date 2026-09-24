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

  // Inicializa el servicio utilizado para administrar las funciones.
  constructor(private funcionesService: Funciones) {}

  // Carga todas las funciones cuando se inicia el componente.
  ngOnInit() {
    this.funcionesService.obtenerTodas().then(resultado => {
      if (resultado.data) this.funciones.set(resultado.data);
      this.cargando.set(false);
    });
  }

  // Elimina una función y la quita de la lista visible.
  async eliminar(id: number) {
    if (!confirm('¿Eliminar esta función?')) return;
    await this.funcionesService.eliminar(id);
    this.funciones.set(this.funciones().filter(f => f.id !== id));
  }
}