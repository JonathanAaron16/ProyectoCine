import { Component, signal } from '@angular/core';
import { form, FormField, required, email, min, max } from '@angular/forms/signals';
import { RouterLink, Router } from '@angular/router';
import { RegistroData } from '../../models/registro-data';
import { Auth } from '../../servicios/auth';
import { Usuarios } from '../../servicios/usuarios';

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

  constructor(private auth: Auth, private usuarios: Usuarios, private router: Router) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    const datos = this.registroModel();

    const resultAuth = await this.auth.signUp(datos.email, datos.password);

    if (resultAuth.error || !resultAuth.data.user) {
      this.errorRegistro.set('No se pudo completar el registro');
      return;
    }

     const resultPerfil = await this.usuarios.crearPerfil({
      id: resultAuth.data.user.id,
      email: datos.email,
      nombre: datos.nombre,
      apellido: datos.apellido,
      fechaNacimiento: datos.fechaNacimiento,
      tipoSangre: datos.tipoSangre,
      colorOjos: datos.colorOjos,
      diasVacaciones: datos.diasVacaciones,
      rol: 'cliente',
    });

    if (resultPerfil.error) {
      this.errorRegistro.set('Cuenta creada, pero hubo un error guardando el perfil');
      return;
    }

    this.router.navigate(['/login']);
  }
}

