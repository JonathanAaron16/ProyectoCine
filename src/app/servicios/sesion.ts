import { Injectable, signal } from '@angular/core';
import { supabase } from './supabase-client';
import { Usuario } from '../models/usuario';
import { Usuarios } from './usuarios';

@Injectable({ providedIn: 'root' })
export class Sesion {
  usuarioActual = signal<Usuario | null>(null);
  cargando = signal(true);

  constructor(private usuariosService: Usuarios) {
    this.inicializar();
  }

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

  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'administrador';
  }

  cerrarSesion() {
    return supabase.auth.signOut();
  }
}