import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Compras } from '../../servicios/compras';
import { Productos } from '../../servicios/productos';
import { Cupones } from '../../servicios/cupones';
import { Sesion } from '../../servicios/sesion';
import { Butaca } from '../../models/butaca';
import { Cupon } from '../../models/cupon';

const PRECIO_VIP_MULTIPLICADOR = 1.5;
const INTERVALO_ACTUALIZACION_MS = 5000;

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './compra.html',
  styleUrl: './compra.css'
})
export class Compra implements OnInit, OnDestroy {
  funcion = signal<any>(null);
  butacas = signal<Butaca[]>([]);
  ocupadas = signal<Set<number>>(new Set());
  seleccionadas = signal<Set<number>>(new Set());
  cargando = signal(true);

  productosDisponibles = signal<any[]>([]);
  carrito = signal<Map<number, number>>(new Map());

  codigoCupon = signal('');
  cuponAplicado = signal<Cupon | null>(null);
  cuponBienvenida = signal<Cupon | null>(null);
  errorCupon = signal('');
  descuentoCompra = signal(0);

  confirmando = signal(false);
  errorConfirmacion = signal('');
  compraConfirmada = signal<any>(null);
  qrDataUrl = signal('');

  private funcionId!: number;
  private intervalo?: ReturnType<typeof setInterval>;
  private butacasCompradas: Butaca[] = [];

  constructor(
    private route: ActivatedRoute,
    private comprasService: Compras,
    private productosService: Productos,
    private cuponesService: Cupones,
    public sesion: Sesion
  ) {}

  async ngOnInit() {
    this.funcionId = Number(this.route.snapshot.paramMap.get('funcionId'));

    const resultadoFuncion = await this.comprasService.obtenerFuncionConSala(this.funcionId);
    if (!resultadoFuncion.data) { this.cargando.set(false); return; }

    this.funcion.set(resultadoFuncion.data);

    const salaId = resultadoFuncion.data.salas.id;
    const resultadoButacas = await this.comprasService.obtenerButacasDeSala(salaId);
    if (resultadoButacas.data) this.butacas.set(resultadoButacas.data);

    const resultadoProductos = await this.productosService.obtenerDisponibles();
    if (resultadoProductos.data) this.productosDisponibles.set(resultadoProductos.data);

    await this.actualizarOcupadas();
    this.cargando.set(false);

    this.intervalo = setInterval(() => this.actualizarOcupadas(), INTERVALO_ACTUALIZACION_MS);

    this.cargarCuponBienvenida();
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  private async cargarCuponBienvenida() {
    while (this.sesion.cargando()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const usuario = this.sesion.usuarioActual();
    if (!usuario) return;

    this.cuponBienvenida.set(await this.cuponesService.buscarCuponBienvenida(usuario));
  }

  private async actualizarOcupadas() {
    const resultado = await this.comprasService.obtenerButacasOcupadas(this.funcionId);
    if (resultado.data) {
      const ocupadasActuales = new Set(resultado.data.map((e: any) => e.butacaId));
      const seleccionActualizada = new Set(
        [...this.seleccionadas()].filter(id => !ocupadasActuales.has(id))
      );
      this.ocupadas.set(ocupadasActuales);
      this.seleccionadas.set(seleccionActualizada);
    }
  }

  toggleButaca(butaca: Butaca) {
    if (this.ocupadas().has(butaca.id)) return;
    const actuales = new Set(this.seleccionadas());
    if (actuales.has(butaca.id)) actuales.delete(butaca.id);
    else actuales.add(butaca.id);
    this.seleccionadas.set(actuales);
  }

  precioButaca(butaca: Butaca): number {
    const base = this.funcion()?.precioBase ?? 0;
    return butaca.tipo === 'vip' ? base * PRECIO_VIP_MULTIPLICADOR : base;
  }

  get butacasSeleccionadas(): Butaca[] {
    return this.butacas().filter(b => this.seleccionadas().has(b.id));
  }

  get filasAgrupadas(): { fila: string; tipo: string; butacas: Butaca[] }[] {
    const mapa = new Map<string, Butaca[]>();
    for (const b of this.butacas()) {
      if (!mapa.has(b.fila)) mapa.set(b.fila, []);
      mapa.get(b.fila)!.push(b);
    }
    return [...mapa.entries()].map(([fila, butacas]) => ({
      fila,
      tipo: butacas[0].tipo,
      butacas: butacas.sort((a, b) => a.numero - b.numero),
    }));
  }

  margenExtra(fila: string): boolean {
    return fila === 'J' || fila === 'R';
  }

  agregarProducto(productoId: number) {
    const actual = new Map(this.carrito());
    actual.set(productoId, (actual.get(productoId) ?? 0) + 1);
    this.carrito.set(actual);
  }

  quitarProducto(productoId: number) {
    const actual = new Map(this.carrito());
    const cantidadActual = actual.get(productoId) ?? 0;
    if (cantidadActual <= 1) actual.delete(productoId);
    else actual.set(productoId, cantidadActual - 1);
    this.carrito.set(actual);
  }

  get itemsCarrito(): { producto: any; cantidad: number }[] {
    return [...this.carrito().entries()].map(([productoId, cantidad]) => ({
      producto: this.productosDisponibles().find(p => p.id === productoId),
      cantidad,
    })).filter(item => item.producto);
  }

  get totalProductos(): number {
    return this.itemsCarrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  }

  get subtotal(): number {
    return this.butacasSeleccionadas.reduce((acc, b) => acc + this.precioButaca(b), 0) + this.totalProductos;
  }

  get descuento(): number {
    const cupon = this.cuponAplicado();
    if (!cupon) return 0;
    return Math.round(this.subtotal * cupon.porcentajeDescuento) / 100;
  }

  get total(): number {
    return this.subtotal - this.descuento;
  }

  async aplicarCupon(codigoManual?: string) {
    const codigo = (codigoManual ?? this.codigoCupon()).trim();
    if (!codigo) {
      this.errorCupon.set('Ingresá un código');
      return;
    }

    this.errorCupon.set('');
    const { cupon, error } = await this.cuponesService.validar(codigo, this.sesion.usuarioActual());

    if (!cupon) {
      this.errorCupon.set(error);
      return;
    }

    this.cuponAplicado.set(cupon);
  }

  quitarCupon() {
    this.cuponAplicado.set(null);
    this.codigoCupon.set('');
    this.errorCupon.set('');
  }

  get requiereMayoriaDeEdad(): boolean {
    return this.funcion()?.peliculas?.clasificacionEdad === '+18';
  }

  get puedeComprar(): boolean {
    if (this.seleccionadas().size === 0) return false;
    if (this.requiereMayoriaDeEdad && !this.esMayorDeEdad()) return false;
    return true;
  }

  private esMayorDeEdad(): boolean {
    const usuario = this.sesion.usuarioActual();
    if (!usuario) return false;
    const nacimiento = new Date(usuario.fechaNacimiento);
    const edad = (Date.now() - nacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return edad >= 18;
  }

  async confirmarCompra() {
    this.confirmando.set(true);
    this.errorConfirmacion.set('');

    this.butacasCompradas = this.butacasSeleccionadas;
    this.descuentoCompra.set(this.descuento);

    const butacasParaComprar = this.butacasCompradas.map(b => ({ id: b.id, precio: this.precioButaca(b) }));

    const productosParaComprar = this.itemsCarrito.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
      precioUnitario: item.producto.precio,
    }));

    const resultado = await this.comprasService.confirmarCompra({
      usuarioId: this.sesion.usuarioActual()?.id ?? null,
      funcionId: this.funcionId,
      butacas: butacasParaComprar,
      productos: productosParaComprar,
      cuponId: this.cuponAplicado()?.id ?? null,
      descuento: this.descuentoCompra(),
    });

    this.confirmando.set(false);

    if (resultado.error) {
      this.errorConfirmacion.set('Una o más butacas ya fueron compradas por otra persona. Elegí de nuevo.');
      await this.actualizarOcupadas();
      return;
    }

    if (this.intervalo) clearInterval(this.intervalo);

    this.compraConfirmada.set(resultado.data);
    this.qrDataUrl.set(await QRCode.toDataURL(resultado.data.codigoQr));
  }

  async descargarComprobante() {
    const doc = new jsPDF();
    const f = this.funcion();
    const compra = this.compraConfirmada();

    doc.setFontSize(18);
    doc.text('Comprobante de compra - Cine App', 20, 20);

    doc.setFontSize(12);
    doc.text(`Película: ${f.peliculas.nombre}`, 20, 35);
    doc.text(`Función: ${f.fecha} - ${f.hora} - ${f.salas.nombre}`, 20, 43);
    doc.text(`Modalidad: ${f.modalidad} (${f.idioma})`, 20, 51);

    let y = 65;
    doc.text('Butacas:', 20, y);
    y += 8;
    for (const b of this.butacasCompradas) {
      doc.text(`  ${b.fila}${b.numero} (${b.tipo}) - $${this.precioButaca(b)}`, 20, y);
      y += 7;
    }

    if (this.itemsCarrito.length > 0) {
      y += 5;
      doc.text('Candy Bar:', 20, y);
      y += 8;
      for (const item of this.itemsCarrito) {
        doc.text(`  ${item.cantidad}x ${item.producto.nombre} - $${item.producto.precio * item.cantidad}`, 20, y);
        y += 7;
      }
    }

    if (this.descuentoCompra() > 0) {
      y += 5;
      doc.text(`Descuento (${this.cuponAplicado()?.codigo}): -$${this.descuentoCompra()}`, 20, y);
      y += 7;
    }

    y += 5;
    doc.text(`Total: $${compra.total}`, 20, y);

    y += 15;
    doc.addImage(this.qrDataUrl(), 'PNG', 20, y, 50, 50);
    y += 58;
    doc.setFontSize(9);
    doc.text(`Código: ${compra.codigoQr}`, 20, y);

    doc.save(`entrada-${compra.id}.pdf`);
  }
}