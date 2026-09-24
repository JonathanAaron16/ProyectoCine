import { CanDeactivateFn } from '@angular/router';
import { Iform } from '../models/IForm';

// Solicita confirmación antes de abandonar un formulario con cambios sin guardar.
export const formGuard: CanDeactivateFn<Iform> = (component) => {
  if (component.noGuardado()) {
    return confirm('Tienes cambios sin guardar. ¿Deseas salir de todos modos?');
  }
  return true;
};