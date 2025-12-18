export interface CalendarRulesConfig {
 businessHours?: { start: number; end: number }; // Horario de operación (Ej: { start: 7, end: 19 })
  minMinutes?: number;                            // Duración mínima (Ej: 60)
  maxMinutes?: number;                            // Duración máxima (Ej: 300)
  minAnticipationMinutes?: number;                // Anticipación mínima (Ej: 1)
  maxAnticipationDays?: number;                   // Anticipación máxima (Ej: 30)
  maxSimultaneousReservations?: number;           // Capacidad máxima simultánea (Ej: 4)

  // Opcionales para el modo Reprogramación
  originalReservaId?: number; // ID de la reserva que se está editando
  originalStart?: Date;       // Fecha original para evitar reprogramar a idéntico
  originalMinutes?: number;   // Minutos originales para evitar reprogramar a idéntico
}