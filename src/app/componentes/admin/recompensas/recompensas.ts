import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Recompensas } from '../../../servicios/recompensas';

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './recompensas.html',
  styleUrl: '../admin.css'
})
export class RecompensasComponent implements OnInit {
  recompensas = signal<any[]>([]);
  cargando = signal(true);

  constructor(private recompensasService: Recompensas) {}

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    const resultado = await this.recompensasService.obtenerTodas();
    if (resultado.data) this.recompensas.set(resultado.data);
    this.cargando.set(false);
  }

  async guardarPuntos(id: number, valor: number) {
    if (!valor || valor < 1) { alert('Tiene que ser mayor a 0'); return; }
    await this.recompensasService.actualizar(id, { puntosNecesarios: valor });
    await this.cargar();
  }

  async alternarActivo(r: any) {
    await this.recompensasService.actualizar(r.id, { activo: !r.activo });
    await this.cargar();
  }

  async eliminar(id: number) {
    if (!confirm('¿Eliminar esta recompensa?')) return;
    await this.recompensasService.eliminar(id);
    await this.cargar();
  }
}