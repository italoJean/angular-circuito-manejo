import { Component, EventEmitter, inject, Inject, Input, OnInit, Output } from '@angular/core';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { ReservaService } from '../../../features/reserva/services/reserva.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ReservaResponse } from '../../../features/reserva/model/reserva-response.model';

@Component({
  selector: 'app-full-calendar',
  imports: [FullCalendarModule,],
  templateUrl: './full-calendar.html',
  styleUrl: './full-calendar.scss',
})
// export class FullCalendar {

//   @Output() dateSelected = new EventEmitter<{ start: string; end: string; minutes: number }>();

//  calendarOptions = {
//     plugins: [ //Define las funcionalidades (plugins) que el calendario cargará
//       dayGridPlugin, // Permite las vistas de cuadrícula como el mes completo
//       timeGridPlugin,//Permite las vistas con ranuras de tiempo y horario
//       interactionPlugin//Permite interacciones del usuario como seleccionar rangos de tiempo
//       ],

//     initialView: 'timeGridWeek',
//     selectable: true,//Habilita la funcionalidad de que el usuario pueda hacer clic y arrastrar para seleccionar un rango de días o de horas en el calendario
//     selectMirror: true,//Muestra un rectángulo semi-transparente mientras el usuario arrastra el ratón para seleccionar un rango de tiempo, dando una retroalimentación visual amigable.
//     allDaySlot: false,//Oculta la fila en la parte superior del calendario que está dedicada a los eventos de "todo el día"
//     slotDuration: '00:30:00',//Define la duración de cada ranura de tiempo que se muestra en la cuadrícula de la agenda.

//     // SE MUESTRA MES, DÍA Y BOTONES
//     headerToolbar: {
//       left: 'prev,next today',//Coloca los botones para ir al periodo anterior (prev), siguiente (next) y el botón para volver a la fecha actual (today)
//       center: 'title',//Muestra el título del periodo actual (ej: "Noviembre 2025" o "Semana del 10 al 16 Nov")
//       right: 'dayGridMonth,timeGridWeek,timeGridDay'//Coloca los botones que permiten al usuario cambiar la vista (Mes, Semana con Horario, Día con Horario)
//     },

//     // events: [
//     //   { title: 'Ejemplo clase', start: '2025-11-14T09:00:00', end: '2025-11-14T10:00:00' },
//     //   { title: 'Ejemplo clase', start: '2025-11-14T14:20:00', end: '2025-11-14T15:12:00' }
//     // ],

//     // Evento cuando seleccionas un rango
//     select: this.onSelect.bind(this)
//   };

//    onSelect(info: any) {
//     // Calcula la duración en minutos
//     const start = new Date(info.startStr);
//     const end = new Date(info.endStr);
//     const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

//     // Emite los datos seleccionados
//     this.dateSelected.emit({
//       start: info.startStr,
//       end: info.endStr,
//       minutes
//     });

//     alert(`Reserva: ${info.startStr} hasta ${info.endStr}\nDuración: ${minutes} minutos`);
//   }
// }


export class FullCalendar implements OnInit {

  @Output() dateSelected = new EventEmitter<{ start: string; end: string; minutes: number }>();
  @Input() vehiculoId?: number; // Para filtrar reservas por vehículo (opcional)

  private readonly reservaService = inject(ReservaService);
  private readonly notificacionService = inject(NotificacionService);

  calendarOptions!: CalendarOptions;
  reservas: ReservaResponse[] = [];
  selectedRange: { start: string; end: string } | null = null;

  ngOnInit() {
    this.loadReservas();
    this.initCalendar();
  }

  // 🔹 Cargar todas las reservas
  loadReservas() {
    this.reservaService.findAll().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.notificacionService.error('Error al cargar reservas existentes.');
      }
    });
  }

  // 🔹 Convertir reservas a eventos del calendario
  private getCalendarEvents() {
    return this.reservas.map(reserva => ({
      title: `Reserva: ${reserva.placaVehiculo}`,
      start: new Date(reserva.fechaReserva).toISOString(),
      end: new Date(
        new Date(reserva.fechaReserva).getTime() + reserva.minutosReservados * 60000
      ).toISOString(),
      backgroundColor: '#ff6b6b', // Rojo para reservas existentes
      borderColor: '#c92a2a',
      extendedProps: {
        vehiculo: reserva.modeloVehiculo,
        boleta: reserva.numeroBoleta
      }
    }));
  }

  // 🔹 Actualizar eventos del calendario
  private updateCalendarEvents() {
    if (this.calendarOptions) {
      this.calendarOptions.events = this.getCalendarEvents() as any;
    }
  }

  // 🔹 Inicializar opciones del calendario
  private initCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      selectable: true,
      selectMirror: true,
      allDaySlot: false,
      slotDuration: '00:30:00',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.getCalendarEvents() as any,
      select: this.onSelect.bind(this),
      // selectConstraint: 'businessHours' // Opcional: solo durante horas de negocio
    };
  }

  // 🔹 Validar si un rango se superpone con reservas existentes
  private isRangeConflict(startStr: string, endStr: string): boolean {
    const selectedStart = new Date(startStr).getTime();
    const selectedEnd = new Date(endStr).getTime();

    return this.reservas.some(reserva => {
      const reservaStart = new Date(reserva.fechaReserva).getTime();
      const reservaEnd = reservaStart + reserva.minutosReservados * 60000;

      // Verifica si hay solapamiento
      return selectedStart < reservaEnd && selectedEnd > reservaStart;
    });
  }


// Propiedades a agregar en la clase:
isValidSelection: boolean = false;
validationMessage: string = '';

@Output() validationStateChanged = new EventEmitter<boolean>();


// Método para validar horario de negocio (8 AM - 6 PM)
private isOutsideBusinessHours(startStr: string, endStr: string): boolean {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const startHour = start.getHours();
  const endHour = end.getHours();

  // Horario de negocio: 8 AM a 6 PM (08:00 a 18:00)
  const businessStart = 8;
  const businessEnd = 18;

  return startHour < businessStart || endHour > businessEnd;
}


 


// 🔹 Manejador de selección en el calendario
onSelect(info: any) {
  const startStr = info.startStr;
  const endStr = info.endStr;

  

   // 1️⃣ Verificar si está FUERA del horario de negocio
  if (this.isOutsideBusinessHours(startStr, endStr)) {
    this.isValidSelection = false;
    this.validationMessage = '❌ Las reservas solo están permitidas entre 8 AM y 6 PM.';
    this.notificacionService.error(this.validationMessage);
    this.validationStateChanged.emit(false);
    return;
  }


  //  2️⃣ Validar conflicto de horario con reservas existentes
  if (this.isRangeConflict(startStr, endStr)) {
    this.isValidSelection = false;
    this.validationMessage = '❌ No puedes realizar una reserva en este rango. Ya existe una reserva conflictiva.';
    this.notificacionService.error(this.validationMessage);
    this.validationStateChanged.emit(false);
    return;
  }

  

  // 3️⃣ Si todo es válido
  const start = new Date(startStr);
  const end = new Date(endStr);
  const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

  // Guarda el rango seleccionado
  this.selectedRange = { start: startStr, end: endStr };

  // Marcar como válido
  this.isValidSelection = true;
  this.validationMessage = `✅ Reserva válida: ${minutes} minutos (${startStr.split('T')[1].substring(0, 5)} - ${endStr.split('T')[1].substring(0, 5)})`;

  // Emitir validez
  this.validationStateChanged.emit(true);

    // Emite los datos seleccionados
  this.dateSelected.emit({
    start: startStr,
    end: endStr,
    minutes
  });
  
  this.notificacionService.success(this.validationMessage);

}
}

    
