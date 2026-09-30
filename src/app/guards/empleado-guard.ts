import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../servicios/sesion';

export const empleadoGuard: CanActivateFn = async () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  while (sesion.cargando()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (sesion.esEmpleado()) {
    return true;
  }

  return router.createUrlTree(['/']);
};