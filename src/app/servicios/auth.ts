import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class Auth {
  // Inicia sesión con las credenciales proporcionadas.
  signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  // Registra un usuario nuevo en el sistema de autenticación.
  signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  }

  // Cierra la sesión del usuario actual.
  signOut() {
    return supabase.auth.signOut();
  }

  // Obtiene los datos del usuario autenticado.
  getUser() {
    return supabase.auth.getUser();
  }
}