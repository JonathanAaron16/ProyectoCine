import { Component, OnInit, signal } from '@angular/core';
import { form, FormField, required, min } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
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
  esEdicion = signal(false);
  productoId = signal<number | null>(null);

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

  constructor(
    private productosService: Productos,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    const { data: categorias } = await this.productosService.obtenerCategorias();
    this.categorias.set(categorias ?? []);

    const { data: productos } = await this.productosService.obtenerDisponibles();
    // Un combo no puede incluirse a sí mismo
    this.productosDisponibles.set(
      (productos ?? []).filter(p => p.id !== id).map(p => ({ id: p.id, nombre: p.nombre }))
    );

    if (id !== null) {
      this.esEdicion.set(true);
      this.productoId.set(id);

      const { data: p } = await this.productosService.obtenerPorId(id);
      if (p) {
        this.productoModel.set({
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          precio: Number(p.precio),
          categoriaId: String(p.categoriaId ?? ''),
          imagen: p.imagen ?? '',
          disponible: p.disponible,
          esCombo: p.esCombo,
        });

        if (p.esCombo) {
          const { data: items } = await this.productosService.obtenerItemsCombo(id);
          this.combosSeleccionados.set(items ?? []);
        }
      }
    }
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

    if (!categoriaId) {
      this.errorGuardado.set('Seleccioná una categoría válida');
      return;
    }

    const payload = { ...datos, categoriaId };

    if (this.esEdicion()) {
      const id = this.productoId()!;

      const { error } = await this.productosService.actualizar(id, payload);
      if (error) {
        this.errorGuardado.set('No se pudo guardar el producto');
        return;
      }

      const { error: errorCombo } = await this.productosService.reemplazarItemsCombo(
        id,
        payload.esCombo ? this.combosSeleccionados() : []
      );
      if (errorCombo) {
        this.errorGuardado.set('Se guardó el producto, pero no los ítems del combo');
        return;
      }
    } else {
      const resultado = await this.productosService.crear(payload, this.combosSeleccionados());
      if (resultado.error) {
        this.errorGuardado.set('No se pudo guardar el producto');
        return;
      }
    }

    this.guardadoConExito.set(true);
    this.router.navigate(['/admin/productos']);
  }
}