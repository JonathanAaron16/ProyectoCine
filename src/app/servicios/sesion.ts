import { Injectable, signal } from '@angular/core';
import { supabase } from './supabase-client';
import { Usuario } from '../models/usuario';
import { Usuarios } from './usuarios';

@Injectable({ providedIn: 'root' })
export class Sesion {
  usuarioActual = signal<Usuario | null>(null);
  cargando = signal(true);

  // Inicializa el servicio y comienza a recuperar la sesión actual.
  constructor(private usuariosService: Usuarios) {
    this.inicializar();
  }

  // Carga el perfil actual y escucha futuros cambios de autenticación.
  private async inicializar() {
    const { data } = await supabase.auth.getSession();

    if (data.session?.user) {
      const perfil = await this.usuariosService.obtenerPerfil(data.session.user.id);
      this.usuarioActual.set(perfil);
    }

    this.cargando.set(false);

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const perfil = await this.usuariosService.obtenerPerfil(session.user.id);
        this.usuarioActual.set(perfil);
      } else {
        this.usuarioActual.set(null);
      }
    });
  }

  // Indica si el usuario actual tiene el rol de administrador.
  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'administrador';
  }

  // Cierra la sesión del usuario actual.
  cerrarSesion() {
    return supabase.auth.signOut();
  }
}