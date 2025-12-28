import { Routes } from '@angular/router';
import { publicGuard } from './core/guards/public-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
{
    path: 'auth',
    canActivate: [publicGuard], // Si ya estoy logueado, me manda al dashboard
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard], // Si no estoy logueado, me manda al login
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  },
  {
    path: '',
    redirectTo: 'auth', // Si entran a la raíz, mándalos al login
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];


//     {
//         path:'',
//         redirectTo:'dashboard',
//         pathMatch:'full'
//     },
//     {
//         path:'dashboard',
//         loadChildren:()=>import('./features/dashboard/dashboard.routes').then(m=>m.dashboardRoutes)
//     },
//     {
//         path:'**',
//         redirectTo:'dashboard',
//         pathMatch:'full'
//     }
// ];
