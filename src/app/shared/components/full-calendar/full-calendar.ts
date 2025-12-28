import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  input,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core/index.js';
import { ReservaService } from '../../../features/reserva/services/reserva.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ReservaResponse } from '../../../features/reserva/model/reserva-response.model';
import { ReservaDetalleModal } from '../../../features/reserva/components/reserva-detalle-modal/reserva-detalle-modal';
import { ModalService } from '../../services/modal.service';
import { CalendarRulesConfig } from '../../../core/models/calendar-rules-config.model';
import { CalendarValidationService } from '../../../core/services/calendar-validation.service';
import { NgClass } from '@angular/common';
import { HorarioOcupadoDTO } from '../../../features/reserva/model/event/horario-ocupado.model';

// Interfaz de los datos emitidos
interface SelectionData {
  start: string; // ISO String limpio (YYYY-MM-DDTHH:mm:ss)
  end: string;
  minutes: number;
}

interface ReservaExtendedProps {
  idReserva: number;
}

@Component({
  selector: 'app-full-calendar',
  imports: [FullCalendarModule, NgClass],
  templateUrl: './full-calendar.html',
  styleUrl: './full-calendar.scss',
})
export class FullCalendar implements OnInit,OnChanges, AfterViewInit {

@Input() reservas: HorarioOcupadoDTO[] = []; // Recibe la lista de reservas del componente padre (ej. Calendario)
  @Input() selectable: boolean = false; //Controla si el usuario puede seleccionar rangos de tiempo en el calendario
  @Input() validationMessage: string = 'Seleccione un rango de tiempo.'; // Mensaje del padre
  @Input() isValidSelection: boolean = false; 

  @Output() dateSelected = new EventEmitter<SelectionData>(); //Emite un evento cuando el usuario selecciona un rango de tiempo en el calendario
  @Output() eventClicked = new EventEmitter<number>();//Emite el ID de la reserva cuando el usuario hace clic en un evento.

  // Obtiene una referencia al componente interno de FullCalendar en el template. Es crucial para acceder a la API
  //  de la librería (getApi()) y manipular el calendario (añadir eventos, deseleccionar, etc.).
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  
  calendarOptions!: CalendarOptions;
  private readonly notificacionService = inject(NotificacionService);

  private estadoColors: Record<string, { bg: string; border: string }> = {
    RESERVADO: { bg: '#4dabf7', border: '#1864ab' }, //CELESTE
    EN_PROGRESO: { bg: '#ffd43b', border: '#d9a400' },//AMARIILLO
    CANCELADO: { bg: '#ff6b6b', border: '#c92a2a' },
    FINALIZADO: { bg: '#51cf66', border: '#2b8a3e' },
  };

  ngOnInit() {
     this.initCalendar();
  }

  //Se dispara cada vez que cambia un @Input(). Detecta cambios en reservas para actualizar el calendario 
  // y en selectable para reconfigurar la selección
  ngOnChanges(changes: SimpleChanges): void {
    // Si el padre asigna una nueva lista de reservas, intenta llamar a updateCalendarEvents() para refrescar el calendario
    if (changes['reservas']) {
      // Solo llamamos a updateCalendarEvents si ya tenemos la referencia al componente.
      this.updateCalendarEvents();
    }
    if (changes['selectable']) {
      this.initCalendar();
      
    }
  }
ngAfterViewInit(): void {
    // 🚨 REINTRODUCIR EL TIMEOUT DE SEGURIDAD
    // Si la data fue pasada (lo cual es seguro gracias al @if del padre)
    if (this.reservas && this.reservas.length > 0) {
        
        // Esperamos 50ms-100ms. Suficiente para que la librería inicialice el DOM.
        // El tiempo aquí es más corto porque sabemos que la data ya llegó.
        setTimeout(() => {
            this.updateCalendarEvents();
        }, 100); 
    }
}

  private initCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      
      // --- CONFIGURACIÓN PARA MÓVILES ---
      selectable: this.selectable,
      selectMirror: this.selectable,
      unselectAuto: true,
      
      // Retraso para distinguir scroll de selección (350ms es el estándar móvil)
      longPressDelay: 350, 
      eventLongPressDelay: 350,
      selectLongPressDelay: 350,
      
      // Mejora la visualización en pantallas pequeñas
      handleWindowResize: true,
      windowResizeDelay: 100,
      
      allDaySlot: false,
      slotDuration: '00:30:00',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      slotMinTime: '05:00:00', // Horario de negocio (visual)
      slotMaxTime: '22:00:00', // Horario de negocio (visual) 19
      events: [] as any,

      select: this.selectable ? this.onSelect.bind(this) : undefined,
      eventClick: this.onEventClick.bind(this),// Asigna la función para manejar el clic en eventos.

      // Opcional: ajustar el encabezado para móviles
      views: {
        timeGridWeek: {
          titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
        },
        timeGridDay: {
          titleFormat: { month: 'long', day: 'numeric' }
        }
      }
    };
  }

  private getCalendarEvents(): EventInput[] {
    // 🚨 Lógica de mapeo de HorarioOcupadoDTO a EventInput
    return this.reservas.map((reserva) => {
      // Obtiene el color correspondiente al estado de la reserva.
      const estadoKey = reserva.estado ? reserva.estado.toString() : 'RESERVADO';
      const colors = this.estadoColors[estadoKey] || this.estadoColors['RESERVADO'];

      // Usamos los campos del DTO directamente
      return {
        // 🚨 Usamos idReserva para el ID del evento
        id: String(reserva.idReserva),
        // 🚨 Usamos campos del DTO para el título
        title: `Reserva ${reserva.placaVehiculo} | Cliente: ${reserva.nombre} ${reserva.apellido}`,
        // 🚨 Usamos inicio y fin del DTO (deben ser strings ISO válidos)
        start: reserva.inicio,
        end: reserva.fin,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        // 🚨 Mapeamos a la nueva interfaz
        extendedProps: { idReserva: reserva.idReserva } as ReservaExtendedProps,
      };
    });
  }

  private updateCalendarEvents() {
    // Intenta obtener la API nativa de FullCalendar.
    const api = this.calendarComponent?.getApi();
    if (!api) {
      // Si la API no está lista (ej. primer renderizado), salimos.
      // ngOnChanges lo intentará de nuevo si hay más cambios.
      console.error('ERROR CRÍTICO: FullCalendar API aún no está disponible.');
      return;
    }
    console.info('ERROR CRÍTICO: FullCalendar API aún no está disponible. opittooo');
    // Limpia todos los eventos existentes antes de cargar la nueva lista.
    api.removeAllEvents();
    // Carga la nueva lista de eventos mapeados.
    api.addEventSource(this.getCalendarEvents());
  }

  // --- MANEJO DE INTERACCIÓN ---

  //Se ejecuta cuando el usuario selecciona un rango (solo si selectable es true).
  onSelect(info: DateSelectArg) {
    const startStr = this.cleanISO(info.startStr);// Limpia la cadena ISO del inicio.
    const endStr = this.cleanISO(info.endStr); // Limpia la cadena ISO del final.
    // Calcula la duración en minutos de la selección.
    const minutes = Math.round((new Date(endStr).getTime() - new Date(startStr).getTime()) / 60000);

    this.validationMessage = `Selección de ${minutes} minutos. Esperando validación...`;
    this.isValidSelection = false;
    this.dateSelected.emit({ start: startStr, end: endStr, minutes });
  }

  // Se ejecuta cuando el usuario hace clic en una reserva existente.
  onEventClick(info: EventClickArg) {
    // Extrae las propiedades extendidas (datos adicionales) del evento clicado.
    const extendedProps = info.event.extendedProps as ReservaExtendedProps;
    //Notifica al componente padre el idReserva del evento clicado para que pueda buscar los detalles y abrir el modal
    this.eventClicked.emit(extendedProps.idReserva);
  }
  // Limpiar ISO (remueve la zona horaria)
  private cleanISO(dateString: string): string {
    return dateString.replace(/([+-]\d{2}:\d{2})$/, '');
  }

  // Permite que el componente padre llame a este método para deseleccionar el rango de tiempo actual en el calendario.
  public clearSelection() {
    this.calendarComponent?.getApi().unselect();
  }
}
