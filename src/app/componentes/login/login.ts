import { Component, signal } from '@angular/core';
import { form, FormField, required, email } from '@angular/forms/signals';
import { RouterLink, Router } from '@angular/router';
import { LoginData } from '../../models/login-data';
import { Auth } from '../../servicios/auth';

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

  constructor(private auth: Auth, private router: Router) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    const credentials = this.loginModel();

    // Hardcodeado por ahora — en el Split 3 esto llama de verdad a Supabase
    console.log('Iniciando sesión con:', credentials);

    const result = await this.auth.signIn(credentials.email, credentials.password);

    if (result.error) {
      this.errorLogin.set('Correo o contraseña incorrectos');
      return;
    }

    this.router.navigate(['/']);
  }
}