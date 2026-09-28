import { Component, OnInit, signal } from '@angular/core';
import { form, FormField, required, min } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Productos } from '../../../servicios/productos';
import { CategoriaProducto } from '../../../models/producto';
import { Iform } from '../../../models/IForm';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [FormField],
  templateUrl: './productos-form.html',
  styleUrl: '../admin.css'
})
export class ProductosForm implements OnInit, Iform {
  categorias = signal<CategoriaProducto[]>([]);
  productosDisponibles = signal<{ id: number; nombre: string }[]>([]);
  combosSeleccionados = signal<{ productoId: number; cantidad: number }[]>([]);
  errorGuardado = signal('');
  guardadoConExito = signal(false);
  nuevaCategoria = signal('');

  productoModel = signal({
    nombre: '',
    descripcion: '',
    precio: 0,
    categoriaId: '',
    imagen: '',
    disponible: true,
    esCombo: false,
  });

  productoForm = form(this.productoModel, (schemaPath) => {
    required(schemaPath.nombre, { message: 'El nombre es obligatorio' });
    required(schemaPath.precio, { message: 'Ingresá el precio' });
    min(schemaPath.precio, 0, { message: 'El precio no puede ser negativo' });
    required(schemaPath.categoriaId, { message: 'Seleccioná una categoría' });
  });

  constructor(private productosService: Productos, private router: Router) {}

  async ngOnInit() {
    const { data: categorias } = await this.productosService.obtenerCategorias();
    this.categorias.set(categorias ?? []);

    const { data: productos } = await this.productosService.obtenerDisponibles();
    this.productosDisponibles.set((productos ?? []).map(p => ({ id: p.id, nombre: p.nombre })));
  }

  noGuardado(): boolean {
    return !this.guardadoConExito();
  }

  async agregarCategoria() {
    const nombre = this.nuevaCategoria().trim();
    if (!nombre) return;

    await this.productosService.crearCategoria(nombre);
    const { data } = await this.productosService.obtenerCategorias();
    this.categorias.set(data ?? []);
    this.nuevaCategoria.set('');
  }

  toggleProductoCombo(productoId: number) {
    const actuales = this.combosSeleccionados();
    if (actuales.some(p => p.productoId === productoId)) {
      this.combosSeleccionados.set(actuales.filter(p => p.productoId !== productoId));
    } else {
      this.combosSeleccionados.set([...actuales, { productoId, cantidad: 1 }]);
    }
  }

  async onSubmit(event: Event) {
  event.preventDefault();

  const datos = this.productoModel();
  const categoriaId = Number(datos.categoriaId);

  if (!categoriaId || categoriaId === 0) {
    this.errorGuardado.set('Seleccioná una categoría válida');
    return;
  }

  const payload = { ...datos, categoriaId };

  const resultado = await this.productosService.crear(payload, this.combosSeleccionados());

  if (resultado.error) {
    this.errorGuardado.set('No se pudo guardar el producto');
    return;
  }

  this.guardadoConExito.set(true);
  this.router.navigate(['/admin/productos']);
}
}