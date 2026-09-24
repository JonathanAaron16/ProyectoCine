import { Component, signal } from '@angular/core';
import { form, FormField, required, email } from '@angular/forms/signals';
import { RouterLink, Router } from '@angular/router';
import { LoginData } from '../../models/login-data';
import { Auth } from '../../servicios/auth';
import { Usuarios } from '../../servicios/usuarios';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El correo es obligatorio' });
    email(schemaPath.email, { message: 'Ingresá un correo válido' });
    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
  });

  errorLogin = signal('');

  // Inicializa los servicios de autenticación, usuarios y navegación.
  constructor(private auth: Auth, private usuariosService: Usuarios, private router: Router) {}

  // Autentica al usuario y lo redirige según su rol.
  async onSubmit(event: Event) {
  event.preventDefault();

  const credentials = this.loginModel();
  const result = await this.auth.signIn(credentials.email, credentials.password);

  if (result.error) {
    this.errorLogin.set('Correo o contraseña incorrectos');
    return;
  }

  const perfil = await this.usuariosService.obtenerPerfil(result.data.user.id);

  if (perfil?.rol === 'administrador') {
    this.router.navigate(['/admin']);
  } else {
    this.router.navigate(['/']);
  }
}
}