import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LogActividad } from '../../../servicios/log-actividad';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './log.html',
  styleUrl: '../admin.css'
})
export class Log implements OnInit {
  registros = signal<any[]>([]);
  cargando = signal(true);

  constructor(private logService: LogActividad) {}

  ngOnInit() {
    this.logService.obtenerTodo().then(resultado => {
      if (resultado.data) this.registros.set(resultado.data);
      this.cargando.set(false);
    });
  }
}