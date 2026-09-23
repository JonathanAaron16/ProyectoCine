import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Compras } from '../../servicios/compras';
import { Sesion } from '../../servicios/sesion';
import { Butaca } from '../../models/butaca';

const PRECIO_VIP_MULTIPLICADOR = 1.5;
const INTERVALO_ACTUALIZACION_MS = 5000;

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [],
  templateUrl: './compra.html',
  styleUrl: './compra.css'
})
export class Compra implements OnInit, OnDestroy {
  funcion = signal<any>(null);
  butacas = signal<Butaca[]>([]);
  ocupadas = signal<Set<number>>(new Set());
  seleccionadas = signal<Set<number>>(new Set());
  cargando = signal(true);

  private funcionId!: number;
  private intervalo?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private comprasService: Compras,
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

    await this.actualizarOcupadas();
    this.cargando.set(false);

    this.intervalo = setInterval(() => this.actualizarOcupadas(), INTERVALO_ACTUALIZACION_MS);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

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

  precioButaca(butaca: Butaca): number {
    const base = this.funcion()?.precioBase ?? 0;
    return butaca.tipo === 'vip' ? base * PRECIO_VIP_MULTIPLICADOR : base;
  }

  get butacasSeleccionadas(): Butaca[] {
    return this.butacas().filter(b => this.seleccionadas().has(b.id));
  }

  get total(): number {
    return this.butacasSeleccionadas.reduce((acc, b) => acc + this.precioButaca(b), 0);
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
//cambiio
  // readonly butacasPorFila = computed(() => {
  //   const grupos = new Map<string, any[]>();

  //   for (const butaca of this.butacas()) {
  //     const fila = grupos.get(butaca.fila) ?? [];
  //     fila.push(butaca);
  //     grupos.set(butaca.fila, fila);
  //   }

  //   return Array.from(grupos.entries()).map(([fila, butacas]) => ({ fila, butacas }));
  // });
}