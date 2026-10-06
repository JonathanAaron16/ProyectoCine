// app.routes.ts
import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { formGuard } from './guards/form-guard';
import { empleadoGuard } from './guards/empleado-guard';

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
  path: 'admin/productos',
  canActivate: [adminGuard],
  loadComponent: () => import('./componentes/admin/productos/productos').then(m => m.ProductosComponent)
},
{
  path: 'admin/productos/nuevo',
  canActivate: [adminGuard],
  canDeactivate: [formGuard],
  loadComponent: () => import('./componentes/admin/productos-form/productos-form').then(m => m.ProductosForm)
},
{
  path: 'admin/productos/:id/editar',
  canActivate: [adminGuard],
  canDeactivate: [formGuard],
  loadComponent: () => import('./componentes/admin/productos-form/productos-form').then(m => m.ProductosForm)
},
{
  path: 'admin/cupones',
  canActivate: [adminGuard],
  loadComponent: () => import('./componentes/admin/cupones/cupones').then(m => m.CuponesComponent)
},
{
  path: 'admin/cupones/nuevo',
  canActivate: [adminGuard],
  canDeactivate: [formGuard],
  loadComponent: () => import('./componentes/admin/cupones-form/cupones-form').then(m => m.CuponesForm)
},
{
  path: 'mis-puntos',
  loadComponent: () => import('./componentes/mis-puntos/mis-puntos').then(m => m.MisPuntos)
},
{
  path: 'admin/recompensas',
  canActivate: [adminGuard],
  loadComponent: () => import('./componentes/admin/recompensas/recompensas').then(m => m.RecompensasComponent)
},
{
  path: 'admin/recompensas/nueva',
  canActivate: [adminGuard],
  canDeactivate: [formGuard],
  loadComponent: () => import('./componentes/admin/recompensas-form/recompensas-form').then(m => m.RecompensasForm)
},
{
  path: 'proximamente',
  loadComponent: () => import('./componentes/proximamente/proximamente').then(m => m.Proximamente)
},
{
  path: 'mis-peliculas',
  loadComponent: () => import('./componentes/mis-peliculas/mis-peliculas').then(m => m.MisPeliculas)
},
{
  path: 'empleado/validar',
  canActivate: [empleadoGuard],
  loadComponent: () => import('./componentes/empleado/validar/validar').then(m => m.Validar)
},
{
  path: 'admin/log',
  canActivate: [adminGuard],
  loadComponent: () => import('./componentes/admin/log/log').then(m => m.Log)
},
{
  path: 'admin/reportes',
  canActivate: [adminGuard],
  loadComponent: () => import('./componentes/admin/reportes/reportes').then(m => m.ReportesComponent)
},
{
  path: 'mis-compras',
  loadComponent: () => import('./componentes/mis-compras/mis-compras').then(m => m.MisCompras)
},

  {
    path: '**',
    loadComponent: () => import('./componentes/error/error').then(m => m.Error)
  }
];
