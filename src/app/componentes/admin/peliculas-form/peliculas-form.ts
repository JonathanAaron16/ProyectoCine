import { Component, signal, OnInit } from '@angular/core';
import { form, FormField, required, min } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { Iform } from '../../../models/IForm';
import { Pelicula } from '../../../models/pelicula';
import { Peliculas } from '../../../servicios/peliculas';
import { supabase } from '../../../servicios/supabase-client';

interface Genero {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-peliculas-form',
  standalone: true,
  imports: [FormField],
  templateUrl: './peliculas-form.html',
  styleUrl: './peliculas-form.css'
})
export class PeliculasForm implements OnInit, Iform {
  // Inicializa la ruta, el navegador y el servicio de películas.
  guardadoConExito = signal(false);
  esEdicion = signal(false);
  peliculaId = signal<number | null>(null);
  generosDisponibles = signal<Genero[]>([]);
  generosSeleccionados = signal<number[]>([]);
  errorGuardado = signal('');

  peliculaModel = signal({
    nombre: '',
    imagen: '',
    sinopsis: '',
    duracionMinutos: 0,
    clasificacionEdad: 'ATP' as 'ATP' | '+13' | '+18',
    idioma: 'Castellano' as 'Castellano' | 'Subtitulada',
    modalidad: '2D' as '2D' | '3D' | '4D' | '5D',
    publicada: true,
    destacada: false,
    tienePreventa: false,
    fechaEstreno: '',
  });

  peliculaForm = form(this.peliculaModel, (schemaPath) => {
    required(schemaPath.nombre, { message: 'El nombre es obligatorio' });
    required(schemaPath.sinopsis, { message: 'La sinopsis es obligatoria' });
    required(schemaPath.duracionMinutos, { message: 'Ingresá la duración' });
    min(schemaPath.duracionMinutos, 1, { message: 'Tiene que ser mayor a 0' });
  });

  noGuardado(): boolean {
    return !this.guardadoConExito();
  }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private peliculasService: Peliculas
  ) {}

  // Carga los géneros y, si corresponde, los datos de la película editada.
  async ngOnInit() {
    const { data: generos } = await supabase.from('generos').select('*').order('nombre');
    this.generosDisponibles.set(generos ?? []);

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion.set(true);
      this.peliculaId.set(Number(idParam));

      const resultado = await this.peliculasService.obtenerPorId(Number(idParam));
      if (resultado.data) {
        const p = resultado.data;
        this.peliculaModel.set({
          nombre: p.nombre,
          imagen: p.imagen,
          sinopsis: p.sinopsis,
          duracionMinutos: p.duracionMinutos,
          clasificacionEdad: p.clasificacionEdad,
          idioma: p.idioma,
          modalidad: p.modalidad,
          publicada: p.publicada,
          destacada: p.destacada,
          tienePreventa: p.tienePreventa,
          fechaEstreno: p.fechaEstreno ?? '',
        });

        const idsGeneros = (p.peliculas_generos ?? []).map((pg: any) => pg.generos.id);
        this.generosSeleccionados.set(idsGeneros);
      }
    }
  }

  // Agrega o quita un género de la selección actual.
  toggleGenero(id: number) {
    const actuales = this.generosSeleccionados();
    if (actuales.includes(id)) {
      this.generosSeleccionados.set(actuales.filter(g => g !== id));
    } else {
      this.generosSeleccionados.set([...actuales, id]);
    }
  }

  // Valida y guarda una película nueva o los cambios de una existente.
   async onSubmit(event: Event) {
    event.preventDefault();

    const datos = this.peliculaModel();
    const payload = {
      ...datos,
      fechaEstreno: datos.fechaEstreno || null,
    };

    const resultado = this.esEdicion()
      ? await this.peliculasService.actualizar(this.peliculaId()!, payload)
      : await this.peliculasService.crear(payload, this.generosSeleccionados());

    if (resultado.error) {
      this.errorGuardado.set('No se pudo guardar la película');
      return;
    }

    this.guardadoConExito.set(true);   // marca que ya se guardó, para no preguntar al salir
    this.router.navigate(['/admin']);
  }
}