import { EstadoReservaEnum } from "../enum/estado-reserva.enum";
import { Paquete } from "./paquete.model";
import { Usuario } from "./usuario.model";

export interface ReservaResponse {
  id: number;
  usuario: Usuario;
  paquete: Paquete;
  fechaReserva: Date;
  estado: EstadoReservaEnum;

}