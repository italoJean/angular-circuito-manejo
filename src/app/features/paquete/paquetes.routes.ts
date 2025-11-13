import { Routes } from "@angular/router";

export const paquetesRoutes:Routes = [
    {
        path:'',
        redirectTo: 'paquetes',
        pathMatch: 'full'
    },
    {
        path:'paquetes',
        loadComponent:() =>import('./pages/paquete-list/paquete-list').then(m=>m.PaqueteList),
        title: 'Listado de Paquetes'
    },
    {
        path:'**',
        redirectTo: 'paquetes',
        pathMatch: 'full'
    }
]