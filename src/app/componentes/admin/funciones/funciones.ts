import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Funciones } from '../../../servicios/funciones';

@Component({
  selector: 'app-funciones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './funciones.html',
  styleUrl: '../admin.css'
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
  // Calcula la hora de finalización de una función basada en su hora de inicio y la duración de la película.
  // horaFin(funcion: any): string {
  //   const [horas, minutos] = funcion.hora.split(':').map(Number);
  //   const duracion = funcion.peliculas?.duracionMinutos ?? 0;
  //   const totalMinutos = horas * 60 + minutos + duracion;
  //   const horaFin = Math.floor(totalMinutos / 60) % 24;
  //   const minutoFin = totalMinutos % 60;
  //   const diaSiguiente = Math.floor(totalMinutos / (24 * 60)) > 0;

  //   return `${String(horaFin).padStart(2, '0')}:${String(minutoFin).padStart(2, '0')}${diaSiguiente ? ' (+1 día)' : ''}`;
  // }

  // Elimina una función y la quita de la lista visible.
  async eliminar(id: number) {
    if (!confirm('¿Eliminar esta función?')) return;
    await this.funcionesService.eliminar(id);
    this.funciones.set(this.funciones().filter(f => f.id !== id));
  }
}