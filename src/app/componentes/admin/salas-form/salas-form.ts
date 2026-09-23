import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Salas } from '../../../servicios/salas';

@Component({
  selector: 'app-salas-form',
  standalone: true,
  imports: [FormField],
  templateUrl: './salas-form.html',
  styleUrl: './salas-form.css'
})
export class SalasForm {
  salaModel = signal({ nombre: '' });

  salaForm = form(this.salaModel, (schemaPath) => {
    required(schemaPath.nombre, { message: 'El nombre de la sala es obligatorio' });
  });

  errorGuardado = signal('');
  guardando = signal(false);
  guardadoConExito = signal(false);

  constructor(private salasService: Salas, private router: Router) {}

  noGuardado(): boolean {
    return !this.guardadoConExito();
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.guardando.set(true);

    const resultado = await this.salasService.crearConButacas(this.salaModel().nombre);

    this.guardando.set(false);

    if (resultado.error) {
      this.errorGuardado.set('No se pudo crear la sala');
      return;
    }

    
    this.guardadoConExito.set(true);
    this.router.navigate(['/admin/salas']);
  }
}