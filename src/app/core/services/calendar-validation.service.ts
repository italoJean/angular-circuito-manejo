import { Injectable } from '@angular/core';
import { CalendarRulesConfig } from '../models/calendar-rules-config.model';
import { ReservaResponse } from '../../features/reserva/model/reserva-response.model';
import { HorarioOcupadoDTO } from '../../features/reserva/model/event/horario-ocupado.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarValidationService {
 // --- Helpers ---
  private calculateEnd(start: Date, minutes: number): Date {
    return new Date(start.getTime() + minutes * 60000);
  }

  // --- Reglas de Tiempo ---
  validateBusinessHours(start: Date, end: Date, rules: CalendarRulesConfig): string | null {
    if (!rules.businessHours) return null;

    const startHour = start.getHours();
    const endHour = end.getHours();

    // FullCalendar visualmente restringe esto, pero validamos la selección.
    if (startHour < rules.businessHours.start || endHour > rules.businessHours.end) {
      return `Las reservas solo se permiten entre ${rules.businessHours.start}:00 y ${rules.businessHours.end}:00.`;
    }

    return null;
  }

  // Reglas de mínimo y máximo de duración
  validateDuration(start: Date, end: Date, rules: CalendarRulesConfig): string | null {
    if (!rules.minMinutes || !rules.maxMinutes) return null;

    const minutes = (end.getTime() - start.getTime()) / 60000;

    if (minutes < rules.minMinutes)
      return `La reserva mínima es de ${rules.minMinutes} minutos.`;

    if (minutes > rules.maxMinutes)
      return `La reserva máxima es de ${rules.maxMinutes} minutos.`;

    return null;
  }

  // Reglas de anticipación
  validateAnticipation(start: Date, rules: CalendarRulesConfig): string | null {
    if (!rules.minAnticipationMinutes || !rules.maxAnticipationDays) return null;

    const now = new Date().getTime();
    const diffMinutes = (start.getTime() - now) / 60000;
    const diffDays = diffMinutes / 1440;

    if (diffMinutes < rules.minAnticipationMinutes)
      return `Debes reservar con al menos ${rules.minAnticipationMinutes} minuto(s) de anticipación.`;

    if (diffDays > rules.maxAnticipationDays)
      return `Solo puedes reservar con hasta ${rules.maxAnticipationDays} días de anticipación.`;

    return null;
  }

  // --- Reglas de Cruce (Solapamiento) ---

  /*
  validateSameVehicle(start: Date, end: Date, reservas: ReservaResponse[], vehiculoId: number, originalReservaId?: number): string | null {
    const startMs = start.getTime();
    const endMs = end.getTime();

    const conflict = reservas.some(r => {
      // 1. Debe ser el mismo vehículo
      // if (r.vehiculoId !== vehiculoId) return false;
      
      // 2. Ignorar si es la reserva que se está reprogramando
      if (originalReservaId && r.id === originalReservaId) return false;

      // 3. Verificar solapamiento
      const rStart = new Date(r.fechaReserva).getTime();
      const rEnd = this.calculateEnd(new Date(r.fechaReserva), r.minutosReservados).getTime();

      return startMs < rEnd && endMs > rStart;
    });

    return conflict ? 'Este vehículo ya tiene una reserva en ese horario.' : null;
  }

  //
  validateSameClient(start: Date, end: Date, reservas: ReservaResponse[], clienteId: number, originalReservaId?: number): string | null {
    const startMs = start.getTime();
    const endMs = end.getTime();

    const conflict = reservas.some(r => {
      // 1. Debe ser el mismo cliente
      if (r.clienteId !== clienteId) return false;

      // 2. Ignorar si es la reserva que se está reprogramando
      if (originalReservaId && r.id === originalReservaId) return false;
      
      // 3. Verificar solapamiento
      const rStart = new Date(r.fechaReserva).getTime();
      const rEnd = this.calculateEnd(new Date(r.fechaReserva), r.minutosReservados).getTime();

      return startMs < rEnd && endMs > rStart;
    });

    return conflict ? 'No puedes reservar dos veces en el mismo horario.' : null;
  }*/

    validateOverlapping(start: Date, end: Date, reservas: HorarioOcupadoDTO[], originalReservaId?: number): string | null {
        const startMs = start.getTime();
        const endMs = end.getTime();

        const conflict = reservas.some(r => {
            if (originalReservaId && r.idReserva === originalReservaId) return false;
            
            const rStart = new Date(r.inicio).getTime();
            // const rEnd = this.calculateEnd(new Date(r.inicio), r.minutosReservados).getTime();
            const rEnd = new Date(r.fin).getTime();

            return startMs < rEnd && endMs > rStart;
        });

        return conflict ? 'Existe un solapamiento en el horario seleccionado.' : null;
    }

  validateFutureTime(start: Date): string | null {
    const now = new Date();
    // Damos un margen de un minuto para evitar problemas de sincronización
    if (start.getTime() <= now.getTime() + (60 * 1000)) { 
        return 'La hora de inicio seleccionada ya ha pasado o es en el minuto actual. Por favor, selecciona una hora futura.';
    }
    return null;
}


  validateMaxSimultaneous(start: Date, end: Date, reservas: HorarioOcupadoDTO[], rules: CalendarRulesConfig, originalReservaId?: number): string | null {
    if (!rules.maxSimultaneousReservations) return null;

    const startMs = start.getTime();
    const endMs = end.getTime();
    let count = 0;

    reservas.forEach(r => {
      // Ignorar si es la reserva que se está reprogramando, ya que no cuenta doble
      if (originalReservaId && r.idReserva === originalReservaId) return;

      const rStart = new Date(r.inicio).getTime();
      // const rEnd = this.calculateEnd(new Date(r.inicio), r.minutosReservados).getTime();
            const rEnd = new Date(r.fin).getTime();

      if (startMs < rEnd && endMs > rStart) count++;
    });

    return count >= rules.maxSimultaneousReservations
      ? `Se alcanzó el máximo de ${rules.maxSimultaneousReservations} reservas simultáneas.`
      : null;
  }
  
  // Regla específica de Reprogramación 
  validateIdenticalReprogramming(start: Date, minutes: number, rules: CalendarRulesConfig): string | null {
      // Solo aplica si tenemos datos de la reserva original
      if (!rules.originalStart || !rules.originalMinutes) return null;
      
      const newStartMs = start.getTime();
      const originalStartMs = rules.originalStart.getTime();
      
      if (newStartMs === originalStartMs && minutes === rules.originalMinutes) {
          return 'La nueva fecha y duración es idéntica a la reserva original. No se requiere reprogramación.';
      }
      return null;
  }
}