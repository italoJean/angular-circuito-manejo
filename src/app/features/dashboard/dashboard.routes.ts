import { Routes } from "@angular/router";
import { Home } from "./pages/home/home";
import { Toolbar } from "../../core/layout/toolbar/toolbar";
import { Calendario } from "../dashboard/pages/calendario/calendario";
import { Analytics } from "./pages/analytics/analytics";


export const dashboardRoutes: Routes = [
    {
        path:'',
        component:Toolbar,
        children:[
            {
                path:'',
                redirectTo:'home',
                pathMatch:'full'
            },
            {
                path:'home',
                component:Home,
                title:'Home'
            },
            {
                path:'calendario',
                component:Calendario,
                // loadComponent:()=>import('../dashboard/pages/calendario/calendario').then((m)=>m.Calendario),
                title:'Calendario'
            },
            {
                path:'grafico',
                component:Analytics,
                // loadComponent:()=>import('../dashboard/pages/calendario/calendario').then((m)=>m.Calendario),
                title:'Gráficos Estadísticos'
            },
            {
                path:'paquete',
                loadChildren:()=>import('../paquete/paquetes.routes').then((m)=>m.paquetesRoutes)
            },
            {
                path:'vehiculo',
                loadChildren:()=>import('../vehiculo/vehiculos.routes').then((m)=>m.vehiculosRoutes)
            },
            {
                path:'usuario',
                loadChildren:()=>import('../usuario/usuarios.routes').then((m)=>m.usuariosRoutes)
            },
            {
                path:'reserva',
                loadChildren:()=>import('../reserva/reservas.routes').then((m)=>m.reservasRoutes)
            },
            {
                path:'pago',
                loadChildren:()=>import('../pago/pagos.routes').then((m)=>m.pagosRoutes)
            },
            {
                path:'**',
                redirectTo:'home',
                pathMatch:'full'
            }
        ]
    }
]