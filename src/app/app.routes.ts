// app.routes.ts
import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { formGuard } from './guards/form-guard';

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
  canActivate: [adminGuard],
  loadComponent: () => import('./componentes/admin/admin').then(m => m.Admin)
},
{
  path: 'admin/peliculas/nueva',
  canActivate: [adminGuard],
  canDeactivate: [formGuard],
  loadComponent: () => import('./componentes/admin/peliculas-form/peliculas-form').then(m => m.PeliculasForm)
},
{
  path: 'admin/peliculas/:id/editar',
  canActivate: [adminGuard],
  canDeactivate: [formGuard],
  loadComponent: () => import('./componentes/admin/peliculas-form/peliculas-form').then(m => m.PeliculasForm)
},
{
  path: 'admin/salas',
  canActivate: [adminGuard],
  loadComponent: () => import('./componentes/admin/salas/salas').then(m => m.SalasComponent)
},
{
  path: 'admin/salas/nueva',
  canActivate: [adminGuard],
  canDeactivate: [formGuard],
  loadComponent: () => import('./componentes/admin/salas-form/salas-form').then(m => m.SalasForm)
},
{
  path: 'admin/funciones',
  canActivate: [adminGuard],
  loadComponent: () => import('./componentes/admin/funciones/funciones').then(m => m.FuncionesComponent)
},
{
  path: 'admin/funciones/nueva',
  canActivate: [adminGuard],
  canDeactivate: [formGuard],
  loadComponent: () => import('./componentes/admin/funciones-form/funciones-form').then(m => m.FuncionesForm)
},
  {
    path: '**',
    loadComponent: () => import('./componentes/error/error').then(m => m.Error)
  }
];
