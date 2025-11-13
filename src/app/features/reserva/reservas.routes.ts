import { Routes } from '@angular/router';

export const reservasRoutes:Routes = [
    {
        path:'',
        redirectTo: 'reservas',
        pathMatch: 'full'
    },
    {
        path:'reservas',
        loadComponent:() =>import('./pages/reserva-list/reserva-list').then(m=>m.ReservaList),
        title: 'Listado de Reservas'
    },
    {
        path:'**',
        redirectTo: 'reservas',
        pathMatch: 'full'
    }
]