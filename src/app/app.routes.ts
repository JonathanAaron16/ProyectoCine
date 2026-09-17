// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/inicio/inicio').then(m => m.Inicio)
  },
  {
    path: 'peliculas',
    loadComponent: () => import('./componentes/peliculas/listado/listado').then(m => m.Listado)
  },
  {
    path: 'peliculas/:id',
    loadComponent: () => import('./componentes/peliculas/detalle/detalle').then(m => m.Detalle)
  },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login').then(m => m.Login)
  },
  {
    path: 'registro',
    loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro)
  },
  {
    path: 'compra/:funcionId',
    loadComponent: () => import('./componentes/compra/compra').then(m => m.Compra)
  },
  {
    path: 'admin',
    loadComponent: () => import('./componentes/admin/admin').then(m => m.Admin)
  },
  {
    path: '**',
    loadComponent: () => import('./componentes/error/error').then(m => m.Error)
  }
];
