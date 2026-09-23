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
  constructor(public sesion: Sesion) {}
}