import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FullCalendar } from '../../../../shared/components/full-calendar/full-calendar';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarValidationService } from '../../../../core/services/calendar-validation.service';
import { ReservaService } from '../../services/reserva.service';
import { ReservaResponse } from '../../model/reserva-response.model';
import { CalendarRulesConfig } from '../../../../core/models/calendar-rules-config.model';
import { take } from 'rxjs';
import { forkJoin } from 'rxjs';
import { NgClass } from '@angular/common';
import { VehiculoService } from '../../../vehiculo/services/vehiculo.service';
import { HorarioOcupadoDTO } from '../../model/event/horario-ocupado.model';


// Interfaz para los datos de entrada del diálogo
interface CalendarDialogData {
  vehiculoId: number;
  pagoId: number;
  // NUEVOS CAMPOS OPCIONALES para el modo Reprogramar:
  // Si se pasan estos, el modal NO llama a loadReservasDual
  // reservasVehiculoInicial?: HorarioOcupadoDTO[]; 
  // reservasClienteInicial?: HorarioOcupadoDTO[];
}

@Component({
  selector: 'app-calendar-selector-dialog',
  imports: [MatDialogContent, FullCalendar, MatDialogActions, MaterialModule],
  templateUrl: './calendar-selector-dialog.html',
  styleUrl: './calendar-selector-dialog.scss',
})
export class CalendarSelectorDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<CalendarSelectorDialog>);
  private readonly validationService = inject(CalendarValidationService);
  private readonly reservaService = inject(ReservaService); // Para obtener todas las reservas
  private readonly vehiculoService = inject(VehiculoService);

  // --- ESTADO LOCAL ---
  selectedDate: string | null = null;
  selectedDuration: number = 0;
  isValidSelection: boolean = false;
  validationMessage: string = 'Seleccione una fecha y duración en el calendario.';
  public isLoadingData: boolean = true; // Control de carga

  // // 🚨 Arreglos separados usando el DTO
  public reservasVehiculo: HorarioOcupadoDTO[] = [];
  public reservasCliente: HorarioOcupadoDTO[] = [];

  // Reglas de negocio (ajusta estos valores según sea necesario)
  private readonly rules: CalendarRulesConfig = {
    businessHours: { start: 7, end: 19 },
    minMinutes: 60,
    maxMinutes: 300, // 5 horas
    minAnticipationMinutes: 30,
    maxAnticipationDays: 60,
    maxSimultaneousReservations: 4, // Máximo 4 reservas totales a la vez
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: CalendarDialogData) {}

  ngOnInit(): void {
    this.loadReservasDual(this.data.vehiculoId, this.data.pagoId);
  // 💡 Lógica Condicional: 
  // Si recibimos las reservas ya cargadas (modo Reprogramar), las usamos directamente.
  // if (this.data.reservasVehiculoInicial && this.data.reservasClienteInicial) {
  //   this.reservasVehiculo = this.data.reservasVehiculoInicial;
  //   this.reservasCliente = this.data.reservasClienteInicial;
  //   this.isLoadingData = false;
  // } else {
  //   // Si no las recibimos (modo Crear/Inicial), las cargamos nosotros.
  //   this.loadReservasDual(this.data.vehiculoId, this.data.pagoId);
  // }
  }

  loadReservasDual(vehiculoId: number, pagoId: number): void {
    this.isLoadingData = true;

    forkJoin({
      // 1. Horarios Ocupados del Vehículo (Usando vehiculoService)
      vehiculoHorario: this.vehiculoService.getHorarioOcupado(vehiculoId).pipe(take(1)),
      // 2. Horarios Ocupados del Cliente (Usando reservaService, asumiendo que el ID es del cliente)
      clienteHorario: this.vehiculoService.getHorarioClientePago(pagoId).pipe(take(1)),
    }).subscribe({
      next: (results: {
        vehiculoHorario: HorarioOcupadoDTO[];
        clienteHorario: HorarioOcupadoDTO[];
      }) => {
        this.reservasVehiculo = results.vehiculoHorario;
        this.reservasCliente = results.clienteHorario;

        this.isLoadingData = false;
      },
      error: (err) => {
        console.error('Error cargando horarios para validación:', err);
        this.validationMessage = 'Error al cargar horarios. Intente más tarde.';
        this.isLoadingData = false;
      },
    });
  }

  // El calendario visual solo muestra los slots ocupados del vehículo
  handleEventClick(reservaId: number): void {
    // Ignorar el click en modo de creación
  }

  // FUNCIÓN CLAVE: Se llama cuando el FullCalendar emite una selección
  onDateSelected(event: { start: string; end: string; minutes: number }) {
    const start = new Date(event.start);
    const end = new Date(event.end);

    this.selectedDate = event.start;
    this.selectedDuration = event.minutes;

    this.isValidSelection = false;

    this.validateSelection(start, end);
  }
  validateSelection(start: Date, end: Date): void {
    let error: string | null = null;

    // 1. Validaciones de Tiempo/Duración/Anticipación
    error = this.validationService.validateFutureTime(start);
    if (error) {
      this.handleValidationError(error);
      return;
    }

    error = this.validationService.validateBusinessHours(start, end, this.rules);
    if (error) {
      this.handleValidationError(error);
      return;
    }

    error = this.validationService.validateDuration(start, end, this.rules);
    if (error) {
      this.handleValidationError(error);
      return;
    }

    error = this.validationService.validateAnticipation(start, this.rules);
    if (error) {
      this.handleValidationError(error);
      return;
    }

    // 2. Validaciones de Cruce y Capacidad (Usando los datos cargados)

    // A. Cruce de VEHÍCULO: Usamos validateOverlapping con reservasVehiculo
    error = this.validationService.validateOverlapping(start, end, this.reservasVehiculo);
    if (error) {
      this.handleValidationError(
        `CRUCE DE VEHÍCULO: Este vehículo ya está reservado en ese horario.`
      );
      return;
    }

    // B. Cruce de CLIENTE: Usamos validateOverlapping con reservasCliente
    error = this.validationService.validateOverlapping(start, end, this.reservasCliente);
    if (error) {
      this.handleValidationError(
        `CRUCE DE CLIENTE: El cliente ya tiene otra reserva en ese horario con otro vehículo.`
      );
      return;
    }

    // C. Máximo Simultáneas: Usa las reservas del vehículo (si la regla aplica por capacidad del vehículo)
    error = this.validationService.validateMaxSimultaneous(
      start,
      end,
      this.reservasVehiculo,
      this.rules
    );
    if (error) {
      this.handleValidationError(`CAPACIDAD: ${error}`);
      return;
    }

    // Si pasó todas las validaciones
    this.handleValidationSuccess();
  }

  private handleValidationError(message: string): void {
    this.validationMessage = `❌ ERROR: ${message}`;
    this.isValidSelection = false;
  }

  private handleValidationSuccess(): void {
    const dateStr = new Date(this.selectedDate!).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.validationMessage = `✅ Reserva válida: ${this.selectedDuration} minutos a partir de las ${dateStr}.`;
    this.isValidSelection = true;
  }

  confirm() {
    if (!this.isValidSelection || !this.selectedDate) return;

    this.dialogRef.close({
      fechaReserva: this.selectedDate,
      minutosReservados: this.selectedDuration,
    });
  }

  close() {
    this.dialogRef.close(undefined);
  }
}
