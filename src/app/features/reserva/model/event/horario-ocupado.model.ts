import { EstadoReservaEnum } from "../../enum/estado-reserva.enum";

export interface HorarioOcupadoDTO {
  idReserva: number;      // Long idReserva
    inicio: string;         // LocalDateTime inicio (se recibe como string ISO)
    fin: string;            // LocalDateTime fin (se recibe como string ISO)
    idPago: number;         // Long idPago (Necesitas este si la validación lo usa)
    idVehiculo: number;     // Long idVehiculo (Útil para la visualización/filtros)
    estado: EstadoReservaEnum; // Estado de la reserva
    nombre: string;
    apellido: string;
    placaVehiculo: string;
    minutosReservados: number;
}
