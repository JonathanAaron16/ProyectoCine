import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';


export const routes: Routes = [

    {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
    },
    {
        path: 'inicio',
        component: Inicio
    },
    {
        path: 'cartelera',
        loadComponent: () => import('./componentes/cartelera/cartelera').then(m => m.Cartelera) 
    }

];
