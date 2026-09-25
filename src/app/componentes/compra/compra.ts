import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Compras } from '../../servicios/compras';
import { Sesion } from '../../servicios/sesion';
import { Butaca } from '../../models/butaca';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';

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
  
  confirmando = signal(false);
  errorConfirmacion = signal('');
  compraConfirmada = signal<any>(null);
  qrDataUrl = signal('');

  private funcionId!: number;
  private intervalo?: ReturnType<typeof setInterval>;
  private butacasCompradas: Butaca[] = [];

  // Inicializa la ruta, el servicio de compras y la sesión del usuario.
  constructor(
    private route: ActivatedRoute,
    private comprasService: Compras,
    public sesion: Sesion
  ) {}

  // Carga la función, la sala y las butacas al iniciar la compra.
 async ngOnInit() {
    this.funcionId = Number(this.route.snapshot.paramMap.get('funcionId'));

    const resultadoFuncion = await this.comprasService.obtenerFuncionConSala(this.funcionId);
    if (!resultadoFuncion.data) { this.cargando.set(false); return; }

    this.funcion.set(resultadoFuncion.data);

    const salaId = resultadoFuncion.data.salas.id;
    const resultadoButacas = await this.comprasService.obtenerButacasDeSala(salaId);
    if (resultadoButacas.data) this.butacas.set(resultadoButacas.data);

    await this.actualizarOcupadas();
    this.cargando.set(false);

    this.intervalo = setInterval(() => this.actualizarOcupadas(), INTERVALO_ACTUALIZACION_MS);
  }

  // Libera el intervalo de actualización al destruir el componente.
  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  // Actualiza las butacas ocupadas y elimina selecciones que ya no están disponibles.
  private async actualizarOcupadas() {
    const resultado = await this.comprasService.obtenerButacasOcupadas(this.funcionId);
    if (resultado.data) {
      const ocupadasActuales = new Set(resultado.data.map((e: any) => e.butacaId));
     
      // Si alguien más ocupó una butaca que yo tenía seleccionada, se la saco de mi selección
      const seleccionActualizada = new Set(
        [...this.seleccionadas()].filter(id => !ocupadasActuales.has(id))
      );
      this.ocupadas.set(ocupadasActuales);
      this.seleccionadas.set(seleccionActualizada);
    }
  }

  // Selecciona o deselecciona una butaca disponible.
  toggleButaca(butaca: Butaca) {
    if (this.ocupadas().has(butaca.id)) return;

    const actuales = new Set(this.seleccionadas());
    if (actuales.has(butaca.id)) {
      actuales.delete(butaca.id);
    } else {
      actuales.add(butaca.id);
    }
    this.seleccionadas.set(actuales);
  }

  // Calcula el precio de una butaca según su tipo.
  precioButaca(butaca: Butaca): number {
    const base = this.funcion()?.precioBase ?? 0;
    return butaca.tipo === 'vip' ? base * PRECIO_VIP_MULTIPLICADOR : base;
  }

  // Devuelve las butacas seleccionadas por el usuario.
  get butacasSeleccionadas(): Butaca[] {
    return this.butacas().filter(b => this.seleccionadas().has(b.id));
  }

  // Calcula el importe total de las butacas seleccionadas.
  get total(): number {
    return this.butacasSeleccionadas.reduce((acc, b) => acc + this.precioButaca(b), 0);
  }

  // Indica si la función requiere que el comprador sea mayor de edad.
  get requiereMayoriaDeEdad(): boolean {
    return this.funcion()?.peliculas?.clasificacionEdad === '+18';
  }

  // Indica si la compra cumple las condiciones necesarias para continuar.
  get puedeComprar(): boolean {
    if (this.seleccionadas().size === 0) return false;
    if (this.requiereMayoriaDeEdad && !this.esMayorDeEdad()) return false;
    return true;
  }

  // Comprueba si el usuario actual tiene al menos 18 años.
  private esMayorDeEdad(): boolean {
    const usuario = this.sesion.usuarioActual();
    if (!usuario) return false;

    const nacimiento = new Date(usuario.fechaNacimiento);
    const edad = (Date.now() - nacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return edad >= 18;
  }

  // Agrupa las butacas por fila para poder dibujar la sala en filas ordenadas.
  get filasAgrupadas(): { fila: string; tipo: string; butacas: Butaca[] }[] {
    // Mapear cada fila a su lista de butacas.
    const mapa = new Map<string, Butaca[]>();

    for (const b of this.butacas()) {
      if (!mapa.has(b.fila)) mapa.set(b.fila, []);
      mapa.get(b.fila)!.push(b);
    }

    



    // Convertir el mapa en un array con la estructura que usa la vista.
    return [...mapa.entries()].map(([fila, butacas]) => ({
      fila,
      tipo: butacas[0].tipo,
      // Ordena las butacas dentro de la fila de menor a mayor número.
      butacas: butacas.sort((a, b) => a.numero - b.numero),
    }));
  }

  // Marca si una fila necesita un espacio extra visual antes de ella.
  // Se usa para separar la fila accesible y el sector VIP del resto de la sala.
  margenExtra(fila: string): boolean {
    return fila === 'J' || fila === 'R';
  }

  async confirmarCompra() {
    this.confirmando.set(true);
    this.errorConfirmacion.set('');

    this.butacasCompradas = this.butacasSeleccionadas;
    const butacasParaComprar = this.butacasCompradas.map(b => ({ id: b.id, precio: this.precioButaca(b) }));

    const resultado = await this.comprasService.confirmarCompra({
      usuarioId: this.sesion.usuarioActual()?.id ?? null,
      funcionId: this.funcionId,
      butacas: butacasParaComprar,
    });

    this.confirmando.set(false);

    if (resultado.error) {
      this.errorConfirmacion.set('Una o más butacas ya fueron compradas por otra persona. Elegí de nuevo.');
      await this.actualizarOcupadas();
      return;
    }

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



