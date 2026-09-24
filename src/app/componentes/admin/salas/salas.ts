import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sala } from '../../../models/sala';
import { Salas } from '../../../servicios/salas';

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './salas.html',
  styleUrl: '../admin.css'
})
export class SalasComponent implements OnInit {
  salas = signal<Sala[]>([]);
  cargando = signal(true);

  // Inicializa el servicio utilizado para administrar las salas.
  constructor(private salasService: Salas) {}

  // Carga todas las salas cuando se inicia el componente.
  ngOnInit() {
    this.salasService.obtenerTodas().then(resultado => {
      if (resultado.data) {
        this.salas.set(resultado.data);
      }
      this.cargando.set(false);
    });
  }
}