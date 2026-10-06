import { Component, input } from '@angular/core';
import { ReadonlyFieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-errores-campo',
  standalone: true,
  imports: [],
  templateUrl: './errores-campo.html',
  styleUrl: './errores-campo.css'
})
export class ErroresCampo {
  campo = input.required<ReadonlyFieldTree<unknown>>();
}