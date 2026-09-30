import { Component, signal } from '@angular/core';
import { Validacion } from '../../../servicios/validacion';
import { Sesion } from '../../../servicios/sesion';

@Component({
  selector: 'app-validar',
  standalone: true,
  imports: [],
  templateUrl: './validar.html',
  styleUrl: './validar.css'
})
export class Validar {
  codigoManual = signal('');
  buscando = signal(false);
  error = signal('');

  compra = signal<any>(null);
  entradas = signal<any[]>([]);
  productos = signal<any[]>([]);

  constructor(private validacionService: Validacion, public sesion: Sesion) {}

  async buscar() {
    const valor = this.codigoManual().trim();
    if (!valor) return;

    this.buscando.set(true);
    this.error.set('');
    this.compra.set(null);

    const resultado = await this.validacionService.buscarCompraPorQr(valor);

    this.buscando.set(false);

    if (resultado.error) {
      this.error.set(resultado.error);
      return;
    }

    this.compra.set(resultado.compra);
    this.entradas.set(resultado.entradas);
    this.productos.set(resultado.productos);
  }

  async validarEntrada(entrada: any) {
    const empleadoId = this.sesion.usuarioActual()?.id;
    if (!empleadoId) return;

    const resultado = await this.validacionService.validarEntrada(entrada.id, empleadoId);

    if (!resultado.exito) {
      this.error.set(resultado.error);
      return;
    }

    await this.buscarDeNuevo();
  }

  async validarProducto(producto: any) {
    const empleadoId = this.sesion.usuarioActual()?.id;
    if (!empleadoId) return;

    const resultado = await this.validacionService.validarProducto(producto.id, empleadoId);

    if (!resultado.exito) {
      this.error.set(resultado.error);
      return;
    }

    await this.buscarDeNuevo();
  }

  private async buscarDeNuevo() {
    const resultado = await this.validacionService.buscarCompraPorQr(this.compra().codigoQr);
    this.entradas.set(resultado.entradas);
    this.productos.set(resultado.productos);
  }

  nuevaBusqueda() {
    this.compra.set(null);
    this.codigoManual.set('');
    this.error.set('');
  }
}