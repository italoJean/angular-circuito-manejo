import { Routes } from "@angular/router";

export const vehiculosRoutes:Routes = [
    {
        path:'',
        redirectTo: 'vehiculos',
        pathMatch: 'full'
    },
    {
        path:'vehiculos',
        loadComponent:() =>import('./pages/vehiculo-list/vehiculo-list').then(m=>m.VehiculoList),
        title: 'Listado de Vehiculos'
    },  
    {
        path:'editar:/id',
        loadComponent:() =>import('./pages/vehiculo-form/vehiculo-form').then(m=>m.VehiculoForm),
        title: 'Formulario de Vehiculos'
    },  
    {
        path:'**',
        redirectTo: 'vehiculos',
        pathMatch: 'full'
    }
]