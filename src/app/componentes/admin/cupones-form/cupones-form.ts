import { Component, signal } from '@angular/core';
import { form, FormField, required, minLength, pattern, min, max } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Cupones } from '../../../servicios/cupones';
import { Iform } from '../../../models/IForm';

@Component({
  selector: 'app-cupones-form',
  standalone: true,
  imports: [FormField],
  templateUrl: './cupones-form.html',
  styleUrl: '../admin.css'
})
export class CuponesForm implements Iform {
  errorGuardado = signal('');
  guardadoConExito = signal(false);

  cuponModel = signal({
    codigo: '',
    porcentajeDescuento: 10,
    tipo: 'general' as 'primeraCompra' | 'mayores50' | 'general',
    fechaVencimiento: '',
    usoUnico: true,
    activo: true,
  });

  cuponForm = form(this.cuponModel, (schemaPath) => {
    required(schemaPath.codigo, { message: 'El código es obligatorio' });
    minLength(schemaPath.codigo, 4, { message: 'Mínimo 4 caracteres' });
    pattern(schemaPath.codigo, /^[A-Za-z0-9]+$/, { message: 'Solo letras y números, sin espacios' });
    required(schemaPath.porcentajeDescuento, { message: 'Ingresá el porcentaje' });
    min(schemaPath.porcentajeDescuento, 1, { message: 'Mínimo 1%' });
    max(schemaPath.porcentajeDescuento, 100, { message: 'Máximo 100%' });
  });

  constructor(private cuponesService: Cupones, private router: Router) {}

  noGuardado(): boolean {
    return !this.guardadoConExito();
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    const datos = this.cuponModel();

    const resultado = await this.cuponesService.crear({
      ...datos,
      codigo: datos.codigo.trim().toUpperCase(),
      fechaVencimiento: datos.fechaVencimiento || null,
    });

    if (resultado.error) {
      this.errorGuardado.set(
        resultado.error.code === '23505'
          ? 'Ya existe un cupón con ese código'
          : 'No se pudo guardar el cupón'
      );
      return;
    }

    this.guardadoConExito.set(true);
    this.router.navigate(['/admin/cupones']);
  }
}