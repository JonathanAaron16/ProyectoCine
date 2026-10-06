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
import { Subscription } from 'rxjs';

const PRECIO_VIP_MULTIPLICADOR = 1.5;


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

  usarCredito = signal(false);


  private suscripcion?: Subscription;
  private funcionId!: number;
  
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

  this.suscripcion = this.comprasService.obtenerOcupadasEnVivo(this.funcionId).subscribe({
      next: (ocupadasActuales) => {
        this.aplicarOcupadas(ocupadasActuales);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error de realtime:', error);
        this.cargando.set(false);
      },
    });

    

    this.cargarCuponBienvenida();
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  private async cargarCuponBienvenida() {
    while (this.sesion.cargando()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const usuario = this.sesion.usuarioActual();
    if (!usuario) return;

    this.cuponBienvenida.set(await this.cuponesService.buscarCuponBienvenida(usuario));
  }

  private aplicarOcupadas(ocupadasActuales: Set<number>) {
  const seleccionActualizada = new Set(
    [...this.seleccionadas()].filter(id => !ocupadasActuales.has(id))
  );
  this.ocupadas.set(ocupadasActuales);
  this.seleccionadas.set(seleccionActualizada);
}

  toggleButaca(butaca: Butaca) {
    if (this.ocupadas().has(butaca.id)) return;
    const actuales = new Set(this.seleccionadas());
    if (actuales.has(butaca.id)) actuales.delete(butaca.id);
    else actuales.add(butaca.id);
    this.seleccionadas.set(actuales);
  }

  precioButaca(butaca: Butaca): number {
    const base = this.precioBaseEfectivo;
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
    return this.subtotal - this.descuento - this.creditoAplicado;
  }
  get estaEnPreventa(): boolean {
    const pelicula = this.funcion()?.peliculas;
    if (!pelicula?.tienePreventa || !pelicula?.precioPreventa || !pelicula?.fechaEstreno) return false;

    const hoy = new Date();
    const estreno = new Date(pelicula.fechaEstreno);
    const inicioPreventa = new Date(estreno);
    inicioPreventa.setDate(inicioPreventa.getDate() - 7);

    return hoy >= inicioPreventa && hoy < estreno;
  }

  get precioBaseEfectivo(): number {
    if (this.estaEnPreventa) return this.funcion()?.peliculas?.precioPreventa ?? 0;
    return this.funcion()?.precioBase ?? 0;
  }

  get creditoDisponible(): number {
    return this.sesion.usuarioActual()?.credito ?? 0;
  }

  get creditoAplicado(): number {
    if (!this.usarCredito()) return 0;
    const maximoAplicable = this.subtotal - this.descuento;
    return Math.min(this.creditoDisponible, maximoAplicable);
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

  get edadMinima(): number {
    const clasificacion = this.funcion()?.peliculas?.clasificacionEdad;
    if (clasificacion === '+18') return 18;
    if (clasificacion === '+13') return 13;
    return 0;
  }

  private edadUsuario(): number | null {
    const usuario = this.sesion.usuarioActual();
    if (!usuario) return null;

    const nacimiento = new Date(usuario.fechaNacimiento);
    return Math.floor((Date.now() - nacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }

  // Usuario registrado cuya edad es menor al mínimo de la película
  get esMenorRegistrado(): boolean {
    const edad = this.edadUsuario();
    return edad !== null && edad < this.edadMinima;
  }

  // Usuario sin cuenta en una película con restricción: no podemos verificar la edad, solo avisar
  get avisoAcompanante(): boolean {
    return this.edadMinima > 0 && !this.sesion.cargando() && this.edadUsuario() === null;
  }

  get puedeComprar(): boolean {
    if (this.sesion.cargando()) return false;
    if (this.seleccionadas().size === 0) return false;
    if (this.esMenorRegistrado) return false;
    return true;
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
      creditoUtilizado: this.creditoAplicado,
    });

    this.confirmando.set(false);

    if (resultado.error) {
      this.errorConfirmacion.set('Una o más butacas ya fueron compradas por otra persona, o hubo un problema con el crédito. Revisá e intentá de nuevo.');
      
      return;
    }

    this.suscripcion?.unsubscribe();

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

    if (this.avisoAcompanante) {
      y += 8;
      doc.setFontSize(9);
      doc.text(`Aviso: función ${f.peliculas.clasificacionEdad}. Los menores de ${this.edadMinima} años deben asistir acompañados por un adulto.`, 20, y);
    }

    doc.save(`entrada-${compra.id}.pdf`);
  }
}