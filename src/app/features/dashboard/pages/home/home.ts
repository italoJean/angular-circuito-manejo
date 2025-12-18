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
      Title: 'Pagos',
      description:
        'Gestiona pagos, cuotas, métodos de pago y el historial financiero de los clientes.',
      traits: ['Pagos', 'Cuotas', 'Métodos'],
      route: '/dashboard/pago/pagos',
      icon: 'payments'
    },
    {
      Title: 'Vehículos',
      description:
        'Administra los vehículos, su disponibilidad, mantenimiento y asignación.',
      traits: ['Automóvil', 'Control', 'Estado'],
      route: '/dashboard/vehiculo/vehiculos',
      icon: 'directions_car'
    },
    {
      Title: 'Paquetes',
      description:
        'Crea y administra paquetes de clases, precios, duración y configuraciones.',
      traits: ['Clases', 'Duración', 'Precios'],
      route: '/dashboard/paquete/paquetes',
      icon: 'inventory_2'
    },
    {
      Title: 'Clientes',
      description:
        'Registro y gestión de clientes, datos personales y control de acceso.',
      traits: ['Registro', 'Control', 'Datos'],
      route: '/dashboard/usuario/usuarios',
      icon: 'people'
    },
    {
      Title: 'Reservas',
      description:
        'Gestión de reservas, disponibilidad de instructores y uso de horas.',
      traits: ['Horarios', 'Clases', 'Instructores'],
      route: '/dashboard/reserva/reservas',
      icon: 'event'
    },
    {
      Title:'Articles',
      description:'This is the module for Articles',
      traits: ['charming','graceful','sassy'],
      route:'/dashboard/article/articles',
    },
  ]
}
