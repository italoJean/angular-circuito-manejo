import { EstadoReservaEnum } from "../enum/estado-reserva.enum";

export interface ReservaRequest {
  id: number;
  usuarioId: number;
  paqueteId: number;
  fechaReserva: Date;
  estado: EstadoReservaEnum;

}
