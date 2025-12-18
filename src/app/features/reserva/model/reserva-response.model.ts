import { EstadoReservaEnum } from '../enum/estado-reserva.enum';
export interface ReservaResponse {
  id: number;
  // IDs de referencia (para el servicio de validación)
  clienteId: number;
  vehiculoId: number;

  numeroBoleta: string;
  nombre: string;
  apellido: string;
  placaVehiculo: string;
  modeloVehiculo: string;
  minutosReservados: number;
  fechaReserva: Date;
  fechaFin: Date;
  estado: EstadoReservaEnum;
}
