import { Component, signal } from '@angular/core';
import { form, FormField, required, email, min, max } from '@angular/forms/signals';
import { RouterLink, Router } from '@angular/router';
import { RegistroData } from '../../models/registro-data';
import { Auth } from '../../servicios/auth';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {

  registroModel = signal<RegistroData>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    tipoSangre: '',
    colorOjos: '',
    diasVacaciones: 0,
  });

  registroForm = form(this.registroModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El correo es obligatorio' });
    email(schemaPath.email, { message: 'Ingresá un correo válido' });

    required(schemaPath.password, { message: 'La contraseña es obligatoria' });

    required(schemaPath.nombre, { message: 'El nombre es obligatorio' });
    required(schemaPath.apellido, { message: 'El apellido es obligatorio' });
    required(schemaPath.fechaNacimiento, { message: 'La fecha de nacimiento es obligatoria' });
    required(schemaPath.tipoSangre, { message: 'El tipo de sangre es obligatorio' });
    required(schemaPath.colorOjos, { message: 'El color de ojos es obligatorio' });

    required(schemaPath.diasVacaciones, { message: 'Ingresá los días de vacaciones' });
    min(schemaPath.diasVacaciones, 0, { message: 'No puede ser negativo' });
    max(schemaPath.diasVacaciones, 365, { message: 'Valor demasiado alto' });
  });

  errorRegistro = signal('');

  constructor(private auth: Auth, private router: Router) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    const datos = this.registroModel();

    // Hardcodeado por ahora — en el Split 3 acá se crea también la fila en la tabla "usuarios"
    // con nombre, apellido, fechaNacimiento, tipoSangre, colorOjos y diasVacaciones
    console.log('Registrando usuario:', datos);

    const result = await this.auth.signUp(datos.email, datos.password);

    if (result.error) {
      this.errorRegistro.set('No se pudo completar el registro');
      return;
    }

    this.router.navigate(['/login']);
  }
}
