import { EstadoReservaEnum } from "../enum/estado-reserva.enum";

export interface ReservaRequest {
  id:number;//
  pagoId: number;
  vehiculoId: number;
  fechaReserva: Date;
  minutosReservados: number;
}
