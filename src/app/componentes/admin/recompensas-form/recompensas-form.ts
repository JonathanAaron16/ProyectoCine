import { Component, signal } from '@angular/core';
import { form, FormField, required, min } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Recompensas } from '../../../servicios/recompensas';
import { Iform } from '../../../models/IForm';

@Component({
  selector: 'app-recompensas-form',
  standalone: true,
  imports: [FormField],
  templateUrl: './recompensas-form.html',
  styleUrl: '../admin.css'
})
export class RecompensasForm implements Iform {
  errorGuardado = signal('');
  guardadoConExito = signal(false);

  recompensaModel = signal({
    nombre: '',
    descripcion: '',
    puntosNecesarios: 100,
    tipo: 'producto' as 'entrada' | 'producto',
    activo: true,
  });

  recompensaForm = form(this.recompensaModel, (schemaPath) => {
    required(schemaPath.nombre, { message: 'El nombre es obligatorio' });
    required(schemaPath.puntosNecesarios, { message: 'Ingresá los puntos necesarios' });
    min(schemaPath.puntosNecesarios, 1, { message: 'Tiene que ser mayor a 0' });
  });

  constructor(private recompensasService: Recompensas, private router: Router) {}

  noGuardado(): boolean {
    return !this.guardadoConExito();
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    const resultado = await this.recompensasService.crear({
      ...this.recompensaModel(),
      productoId: null,
    });

    if (resultado.error) {
      this.errorGuardado.set('No se pudo guardar la recompensa');
      return;
    }

    this.guardadoConExito.set(true);
    this.router.navigate(['/admin/recompensas']);
  }
}