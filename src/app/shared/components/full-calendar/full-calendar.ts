import {
  AfterViewInit,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
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
export class FullCalendar implements OnInit, OnChanges, AfterViewInit {

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
    RESERVADO: { bg: '#4dabf7', border: '#1864ab' },
    EN_PROGRESO: { bg: '#ffd43b', border: '#d9a400' },
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
      selectable: this.selectable,
      selectMirror: this.selectable,
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

/*
  // EventEmitter que envía el rango seleccionado
  @Output() dateSelected = new EventEmitter<{ start: string; end: string; minutes: number }>();
  @Output() validationStateChanged = new EventEmitter<boolean>();

  //  Id del vehículo para filtrar nuevas funciones
  @Input() vehiculoId?: number;
  @Input() selectable: boolean = false; //seleccionar

  private readonly modalService = inject(ModalService);
  private readonly reservaService = inject(ReservaService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly destroyRef = inject(DestroyRef);

  calendarOptions!: CalendarOptions;
  reservas: ReservaResponse[] = [];

  // Almacena el rango seleccionado
  selectedRange: { start: string; end: string } | null = null;

  // Estados de validación
  isValidSelection: boolean = false;
  // validationMessage: string = '';
  validationMessage: string = 'Seleccione un rango de tiempo para reservar.';

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  ngOnInit() {
    this.initCalendar(); // Inicializa Calendar.js
    this.loadReservas();
  }

  // Cargar todas las reservas
  loadReservas() {
    this.reservaService.findAll()
    .pipe(
      takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.updateCalendarEvents(); // Refresca eventos
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.notificacionService.error('Error al cargar reservas existentes.');
      },
    });
  }


  // Convertir reservas a eventos del calendario
  private getCalendarEvents() {
    return this.reservas.map((reserva) => {
          const colors = this.estadoColors[reserva.estado] || this.estadoColors['RESERVADO'];
          return {
      id: String(reserva.id),
      title: `Reserva: ${reserva.placaVehiculo} Cliente: ${reserva.nombre} ${reserva.apellido}`,
      start: new Date(reserva.fechaReserva).toISOString(),
      end: new Date(
        new Date(reserva.fechaReserva).getTime() + reserva.minutosReservados * 60000
      ).toISOString(),
        backgroundColor: colors.bg,
      borderColor: colors.border,

      extendedProps: {
        id: reserva.id,
        reserva: reserva,
    
      },
    };
  });
}

  //colores de la reserva
private estadoColors: Record<string, { bg: string; border: string }> = {
  RESERVADO:   { bg: '#4dabf7', border: '#1864ab' }, // azul
  EN_PROGRESO: { bg: '#ffd43b', border: '#d9a400' }, // amarillo
  CANCELADO:   { bg: '#ff6b6b', border: '#c92a2a' }, // rojo
  FINALIZADO:  { bg: '#51cf66', border: '#2b8a3e' }, // verde
};


  // Actualizar eventos del calendario
  private updateCalendarEvents() {
    const api = this.calendarComponent?.getApi();
    if (!api) return;

    api.removeAllEvents();
    api.addEventSource(this.getCalendarEvents());
  }

  // Configuración del calendario
  private initCalendar() {
    this.calendarOptions = {
      plugins: [
        //Define las funcionalidades (plugins) que el calendario cargará
        dayGridPlugin, // Permite las vistas de cuadrícula como el mes completo
        timeGridPlugin, //Permite las vistas con ranuras de tiempo y horario
        interactionPlugin, //Permite interacciones del usuario como seleccionar rangos de tiempo
      ],
      initialView: 'timeGridWeek',
      selectable: this.selectable, //Habilita la funcionalidad de que el usuario pueda hacer clic y arrastrar para seleccionar un rango de días o de horas en el calendario
      selectMirror: this.selectable, //Muestra un rectángulo semi-transparente mientras el usuario arrastra el ratón para seleccionar un rango de tiempo, dando una retroalimentación visual amigable.

      allDaySlot: false, //Oculta la fila en la parte superior del calendario que está dedicada a los eventos de "todo el día"
      slotDuration: '00:30:00', //Define la duración de cada ranura de tiempo que se muestra en la cuadrícula de la agenda.
      // SE MUESTRA MES, DÍA Y BOTONES
      headerToolbar: {
        left: 'prev,next today', //Coloca los botones para ir al periodo anterior (prev), siguiente (next) y el botón para volver a la fecha actual (today)
        center: 'title', //Muestra el título del periodo actual (ej: "Noviembre 2025" o "Semana del 10 al 16 Nov")
        right: 'dayGridMonth,timeGridWeek,timeGridDay', //Coloca los botones que permiten al usuario cambiar la vista (Mes, Semana con Horario, Día con Horario)
      },
      events: this.getCalendarEvents() as any,
      select: this.selectable ? this.onSelect.bind(this) : undefined, // Manejador al seleccionar rango
  // eventContent: this.renderEventContent.bind(this),


      eventClick: this.onEventClick.bind(this), //  Click en evento = abrir modal
    };
  }


  // Click en evento = obtener reserva + modal
  onEventClick(info: any) {
  const id = info.event.extendedProps.id;

  this.reservaService.findByIdDetalle(id).subscribe({
    next: (detalle) => {
      // abrir modal con TODA la info COMPLETA
      this.modalService
        .openModal(ReservaDetalleModal, detalle, {
          width: '650px', // o más si necesitas
        })
        .subscribe((result) => {
          console.log('Modal cerrado con:', result);
        });
    },
    error: (err) => {
      console.error('Error obteniendo detalle:', err);
      this.notificacionService.error('No se pudo cargar el detalle de la reserva.');
    },
  });
}


  // Limpiar ISO (Elimiina -05:00)
  private cleanISO(dateString: string): string {
    return dateString.replace(/([+-]\d{2}:\d{2})$/, '');
  }

  // Validar si existe una reserva en conflicto
  private isRangeConflict(startStr: string, endStr: string): boolean {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();

    return this.reservas.some((reserva) => {
      const reservaStart = new Date(reserva.fechaReserva).getTime();
      const reservaEnd = reservaStart + reserva.minutosReservados * 60000;

      // Verifica si hay solapamiento
      return start < reservaEnd && end > reservaStart;
    });
  }

  // Máximo 8 reservas por el mismo bloque horario
  private isMaxReservationsReached(startStr: string, endStr: string): boolean {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();

  let count = 0;

  this.reservas.forEach((reserva) => {
    const reservaStart = new Date(reserva.fechaReserva).getTime();
    const reservaEnd = reservaStart + reserva.minutosReservados * 60000;

    // Si se solapa cuenta como reserva en ese horario
    if (start < reservaEnd && end > reservaStart) {
      count++;
    }
  });

  return count >= 4;
}

  // @Input() clienteId!: number;
@Input() clienteNombre!: string;
@Input() clienteApellido!: string;

private isSameClientConflict(startStr: string, endStr: string): boolean {
  if (!this.clienteNombre || !this.clienteApellido) return false;

  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();

  return this.reservas.some((reserva) => {

    // ✔ Verifica que sea el mismo cliente
    const esMismoCliente =
      reserva.nombre.trim().toLowerCase() === this.clienteNombre.trim().toLowerCase() &&
      reserva.apellido.trim().toLowerCase() === this.clienteApellido.trim().toLowerCase();

    if (!esMismoCliente) return false; // Si no es el mismo cliente → no bloquear

    // ✔ Calcular solapamiento
    const reservaStart = new Date(reserva.fechaReserva).getTime();
    const reservaEnd = reservaStart + reserva.minutosReservados * 60000;

    const overlap = start < reservaEnd && end > reservaStart;

    return overlap;
  });
}

  // Validar horario de negocio (7 AM - 19 PM)
  private isOutsideBusinessHours(startStr: string, endStr: string): boolean {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const startHour = start.getHours();
    const endHour = end.getHours();

    // Horario de negocio: 7 AM a  PM (07:00 a 19:00)
    const businessStart = 7;
    const businessEnd = 19;

    return startHour < businessStart || endHour > businessEnd;
  }

  // Manejar selección en el calendario
  onSelect(info: any) {
    const startStr = this.cleanISO(info.startStr);
    const endStr = this.cleanISO(info.endStr);
    console.log(startStr, 'pruebaaa');
    // Validación de horario permitido
    if (this.isOutsideBusinessHours(startStr, endStr)) {
      this.markInvalid('❌ Las reservas solo se permiten entre 7 AM y 7 PM.');
      return;
    }

     // Validación: máximo 8 reservas
  if (this.isMaxReservationsReached(startStr, endStr)) {
    this.markInvalid('❌ Ya se alcanzó el máximo de 8 reservas para este horario.');
    return;
  }

  
  // Validación: cliente no puede reservar dos veces en el mismo horario
  if (this.isSameClientConflict(startStr, endStr)) {
    this.markInvalid('❌ No puedes reservar dos veces en el mismo horario.');
    return;
  }

    // Si pasó todas las validaciones
    this.markValid(startStr, endStr);
  }

  // Marcar como inválido
  private markInvalid(message: string) {
    this.isValidSelection = false;
    this.validationMessage = message;
    this.validationStateChanged.emit(false);
    this.notificacionService.error(message);
  }

  // Marcar como válido
  private markValid(startStr: string, endStr: string) {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);

    this.selectedRange = { start: startStr, end: endStr };

    this.isValidSelection = true;
    // this.validationMessage = `✅ Reserva válida: ${minutes} minutos`;
    this.validationMessage = `✅ Reserva válida: ${minutes} minutos (${startStr
      .split('T')[1]
      .substring(0, 5)} - ${endStr.split('T')[1].substring(0, 5)})`;

    this.validationStateChanged.emit(true);
    this.notificacionService.success(this.validationMessage);

    // Emitir selección al componente padre
    this.dateSelected.emit({
      start: startStr,
      end: endStr,
      minutes,
    });
  }
}

*/
