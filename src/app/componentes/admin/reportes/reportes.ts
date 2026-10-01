import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { Chart } from 'chart.js/auto';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Reportes } from '../../../servicios/reportes';

function fechaHoy(offsetDias = 0): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + offsetDias);
  return fecha.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit {
  @ViewChild('graficoFacturacion') canvasRef!: ElementRef<HTMLCanvasElement>;

  fechaInicio = signal(fechaHoy(-29));
  fechaFin = signal(fechaHoy());

  cargando = signal(true);
  totalFacturado = signal(0);
  cantidadEntradas = signal(0);
  peliculasMasVistas = signal<{ nombre: string; cantidad: number }[]>([]);
  productosMasVendidos = signal<{ nombre: string; cantidad: number }[]>([]);
  ventasPorDia = signal<{ fecha: string; total: number }[]>([]);

  private chart?: Chart;

  constructor(private reportesService: Reportes) {}

  ngOnInit() {
    this.generarReporte();
  }

  async generarReporte() {
    this.cargando.set(true);

    const [ventas, entradas, peliculas, productos] = await Promise.all([
      this.reportesService.obtenerVentasEnRango(this.fechaInicio(), this.fechaFin()),
      this.reportesService.obtenerEntradasEnRango(this.fechaInicio(), this.fechaFin()),
      this.reportesService.obtenerPeliculasMasVistas(this.fechaInicio(), this.fechaFin()),
      this.reportesService.obtenerProductoMasVendido(this.fechaInicio(), this.fechaFin()),
    ]);

    this.totalFacturado.set(ventas.reduce((acc, v) => acc + v.total, 0));
    this.cantidadEntradas.set(entradas.length);
    this.peliculasMasVistas.set(peliculas.slice(0, 5));
    this.productosMasVendidos.set(productos.slice(0, 5));

    const porDia = new Map<string, number>();
    for (const venta of ventas) {
      const dia = venta.fecha.slice(0, 10);
      porDia.set(dia, (porDia.get(dia) ?? 0) + venta.total);
    }
    this.ventasPorDia.set([...porDia.entries()].map(([fecha, total]) => ({ fecha, total })).sort((a, b) => a.fecha.localeCompare(b.fecha)));

    this.cargando.set(false);

    setTimeout(() => this.dibujarGrafico(), 0);
  }

  private dibujarGrafico() {
    if (!this.canvasRef) return;

    this.chart?.destroy();

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.ventasPorDia().map(v => v.fecha),
        datasets: [{
          label: 'Facturación por día',
          data: this.ventasPorDia().map(v => v.total),
          backgroundColor: '#e50914',
        }],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  exportarPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de facturación - Cine App', 20, 20);
    doc.setFontSize(10);
    doc.text(`Período: ${this.fechaInicio()} a ${this.fechaFin()}`, 20, 28);

    doc.setFontSize(12);
    doc.text(`Total facturado: $${this.totalFacturado()}`, 20, 42);
    doc.text(`Entradas vendidas: ${this.cantidadEntradas()}`, 20, 50);

    let y = 64;
    doc.text('Películas más vistas:', 20, y);
    y += 8;
    for (const p of this.peliculasMasVistas()) {
      doc.text(`  ${p.nombre}: ${p.cantidad}`, 20, y);
      y += 6;
    }

    y += 6;
    doc.text('Productos más vendidos:', 20, y);
    y += 8;
    for (const p of this.productosMasVendidos()) {
      doc.text(`  ${p.nombre}: ${p.cantidad}`, 20, y);
      y += 6;
    }

    doc.save(`reporte-${this.fechaInicio()}-a-${this.fechaFin()}.pdf`);
  }

  exportarExcel() {
    const libro = XLSX.utils.book_new();

    const hojaVentas = XLSX.utils.json_to_sheet(this.ventasPorDia());
    XLSX.utils.book_append_sheet(libro, hojaVentas, 'Ventas por día');

    const hojaPeliculas = XLSX.utils.json_to_sheet(this.peliculasMasVistas());
    XLSX.utils.book_append_sheet(libro, hojaPeliculas, 'Películas más vistas');

    const hojaProductos = XLSX.utils.json_to_sheet(this.productosMasVendidos());
    XLSX.utils.book_append_sheet(libro, hojaProductos, 'Productos más vendidos');

    XLSX.writeFile(libro, `reporte-${this.fechaInicio()}-a-${this.fechaFin()}.xlsx`);
  }
}