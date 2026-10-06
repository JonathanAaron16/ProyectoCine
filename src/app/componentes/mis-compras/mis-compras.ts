import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Sesion } from '../../servicios/sesion';
import { Compras } from '../../servicios/compras';
import { Usuarios } from '../../servicios/usuarios';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css'
})
export class MisCompras implements OnInit {
  compras = signal<any[]>([]);
  cargando = signal(true);
  mensajeError = signal<{ [id: number]: string }>({});

  constructor(public sesion: Sesion, private comprasService: Compras, private usuariosService: Usuarios) {}


  async ngOnInit() {
    while (this.sesion.cargando()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const usuario = this.sesion.usuarioActual();
    if (!usuario) { this.cargando.set(false); return; }

    await this.cargar(usuario.id);
  }

  private async cargar(usuarioId: string) {
    const resultado = await this.comprasService.obtenerMisCompras(usuarioId);
    if (resultado.data) this.compras.set(resultado.data);
    this.cargando.set(false);
  }

  puedeCancelarse(compra: any): boolean {
    if (compra.estado !== 'confirmada') return false;

    const primeraEntrada = compra.entradas?.[0];
    if (!primeraEntrada) return false;

    const inicioFuncion = new Date(`${primeraEntrada.funciones.fecha}T${primeraEntrada.funciones.hora}`);
    const dosHorasAntes = new Date(inicioFuncion.getTime() - 2 * 60 * 60 * 1000);

    return new Date() < dosHorasAntes;
  }

  async cancelar(compra: any) {
    if (!confirm('¿Cancelar esta compra? El importe se convertirá en crédito, no se devuelve dinero.')) return;

    const usuario = this.sesion.usuarioActual();
    if (!usuario) return;

    const resultado = await this.comprasService.cancelarCompra(compra.id, usuario.id);

    if (!resultado.exito) {
      this.mensajeError.update(actual => ({ ...actual, [compra.id]: resultado.error }));
      return;
    }

    const perfilActualizado = await this.usuariosService.obtenerPerfil(usuario.id);
    if (perfilActualizado) this.sesion.usuarioActual.set(perfilActualizado);

    await this.cargar(usuario.id);
  }
}