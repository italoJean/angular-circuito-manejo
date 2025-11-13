import { Routes } from '@angular/router';

export const usuariosRoutes:Routes = [
    {
        path:'',
        redirectTo: 'usuarios',
        pathMatch: 'full'
    },
    {
        path:'usuarios',
        loadComponent:() =>import('./pages/usuario-list/usuario-list').then(m=>m.UsuarioList),
        title: 'Listado de Usuarios'
    },
    {
        path:'**',
        redirectTo: 'usuarios',
        pathMatch: 'full'
    }
]