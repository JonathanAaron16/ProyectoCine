import { Component, OnInit, signal } from '@angular/core';
import { Sesion } from '../../servicios/sesion';
import { Recompensas } from '../../servicios/recompensas';
import { Usuarios } from '../../servicios/usuarios';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-mis-puntos',
  standalone: true,
  imports: [ DatePipe],
  templateUrl: './mis-puntos.html',
  styleUrl: './mis-puntos.css'
})
export class MisPuntos implements OnInit {
  recompensas = signal<any[]>([]);
  historial = signal<any[]>([]);
  cargando = signal(true);
  mensajeCanje = signal('');
  errorCanje = signal('');

  constructor(
    public sesion: Sesion,
    private recompensasService: Recompensas,
    private usuariosService: Usuarios
  ) {}

  async ngOnInit() {
    while (this.sesion.cargando()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const usuario = this.sesion.usuarioActual();
    if (!usuario) { this.cargando.set(false); return; }

    await this.cargarDatos(usuario.id);
  }

  private async cargarDatos(usuarioId: string) {
    const [resultadoRecompensas, resultadoHistorial] = await Promise.all([
      this.recompensasService.obtenerDisponibles(),
      this.recompensasService.obtenerHistorialCanjes(usuarioId),
    ]);

    if (resultadoRecompensas.data) this.recompensas.set(resultadoRecompensas.data);
    if (resultadoHistorial.data) this.historial.set(resultadoHistorial.data);

    this.cargando.set(false);
  }

  async canjear(recompensaId: number) {
    const usuario = this.sesion.usuarioActual();
    if (!usuario) return;

    this.mensajeCanje.set('');
    this.errorCanje.set('');

    const resultado = await this.recompensasService.canjear(usuario.id, recompensaId);

    if (resultado.error) {
      this.errorCanje.set(resultado.error);
      return;
    }

    this.mensajeCanje.set(`¡Canje realizado! Código: ${resultado.codigo}`);

    const perfilActualizado = await this.usuariosService.obtenerPerfil(usuario.id);
    if (perfilActualizado) this.sesion.usuarioActual.set(perfilActualizado);

    await this.cargarDatos(usuario.id);
  }
}