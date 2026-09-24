import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../servicios/sesion';

// Permite acceder a las rutas administrativas únicamente a usuarios administradores.
export const adminGuard: CanActivateFn = async (route, state) => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  while (sesion.cargando()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (sesion.esAdmin()) {
    return true;
  }

  return router.createUrlTree(['/']);
};