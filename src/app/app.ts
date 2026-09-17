import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PiePagina } from './componentes/pie-pagina/pie-pagina';
import { Encabezado } from './componentes/encabezado/encabezado';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Encabezado, PiePagina],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ProyectoCine');
}
