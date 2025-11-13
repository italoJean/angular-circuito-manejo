import { Routes } from '@angular/router';

export const pagosRoutes:Routes = [
    {
        path:'',
        redirectTo: 'pagos',
        pathMatch: 'full'
    },
    {
        path:'pagos',
        loadComponent:() =>import('./pages/pago-list/pago-list').then(m=>m.PagoList),
        title: 'Listado de Pagos'
    },
    {
        path:'**',
        redirectTo: 'pagos',
        pathMatch: 'full'
    }
]