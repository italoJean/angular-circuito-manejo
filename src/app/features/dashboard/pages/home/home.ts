import { Component } from '@angular/core';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [MaterialModule,RouterLink,CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  modules =[
    {
      Title:'Pagos',
      description:'This is the module for Admins',
      traits: ['charming','graceful','sassy'],
      route:'/dashboard/pago/pagos',
    },{
      Title:'Vehiculos',
      description:'This is the module for Users',
      traits: ['fluffy','alert','intelligent'],
      route:'/dashboard/vehiculo/vehiculos',
    },{
      Title:'Paquetes',
      description:'This is the module for Viewers',
      traits: ['charming','graceful','sassy'],
      route:'/dashboard/paquete/paquetes',
    },
    {
      Title:'Usuarios',
      description:'This is the module for Editors',
      traits: ['charming','graceful','sassy'],
      route:'/dashboard/usuario/usuarios',
    },
    {
      Title:'Reservas',
      description:'This is the module for Cars',
      traits: ['charming','graceful','sassy'],
      route:'/dashboard/reserva/reservas',
    },
    {
      Title:'Articles',
      description:'This is the module for Articles',
      traits: ['charming','graceful','sassy'],
      route:'/dashboard/article/articles',
    },
  ]
}
