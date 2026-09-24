import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Sesion } from '../../servicios/sesion';

@Component({
  selector: 'app-encabezado',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css'
})
export class Encabezado {
  // Inicializa la sesión que utiliza el encabezado para mostrar el estado del usuario.
  constructor(public sesion: Sesion) {}
}