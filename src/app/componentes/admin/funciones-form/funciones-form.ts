import { Component, OnInit, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Funciones } from '../../../servicios/funciones';
import { supabase } from '../../../servicios/supabase-client';
import { Iform } from '../../../models/IForm';

@Component({
  selector: 'app-funciones-form',
  standalone: true,
  imports: [FormField],
  templateUrl: './funciones-form.html',
  styleUrl: './funciones-form.css'
})
export class FuncionesForm implements OnInit, Iform {
  peliculas = signal<{ id: number; nombre: string; duracionMinutos: number }[]>([]);
  errorGuardado = signal('');
  guardando = signal(false);
  guardadoConExito = signal(false);

  funcionModel = signal({
  peliculaId: '',          // 👈 string en vez de number
  fecha: '',
  hora: '',
  idioma: 'Castellano' as 'Castellano' | 'Subtitulada',
  modalidad: '2D' as '2D' | '3D' | '4D' | '5D',
  precioBase: 0,
});

  funcionForm = form(this.funcionModel, (schemaPath) => {
    required(schemaPath.peliculaId, { message: 'Seleccioná una película' });
    required(schemaPath.fecha, { message: 'La fecha es obligatoria' });
    required(schemaPath.hora, { message: 'El horario es obligatorio' });
    required(schemaPath.precioBase, { message: 'Ingresá el precio base' });
  });

  // Inicializa los servicios necesarios para crear funciones y navegar.
  constructor(private funcionesService: Funciones, private router: Router) {}

  // Carga las películas publicadas que pueden tener nuevas funciones.
  async ngOnInit() {
    const { data } = await supabase.from('peliculas').select('id, nombre, duracionMinutos').eq('publicada', true);
    this.peliculas.set(data ?? []);
  }

  // Indica si todavía hay cambios pendientes de guardar.
  noGuardado(): boolean {
    return !this.guardadoConExito();
  }

  // Valida y guarda la función enviada desde el formulario.
  async onSubmit(event: Event) {
    event.preventDefault();
    this.guardando.set(true);
    this.errorGuardado.set('');

    const datos = this.funcionModel();
    const pelicula = this.peliculas().find(p => p.id === Number(datos.peliculaId));

    if (!pelicula) {
      this.errorGuardado.set('Seleccioná una película válida');
      this.guardando.set(false);
      return;
    }

    const resultado = await this.funcionesService.crear(
      { ...datos, peliculaId: pelicula.id },
      pelicula.duracionMinutos
    );

    this.guardando.set(false);

    if (resultado.error) {
      this.errorGuardado.set(resultado.error.message ?? 'No se pudo crear la función');
      return;
    }

    this.guardadoConExito.set(true);
    this.router.navigate(['/admin/funciones']);
  }
}