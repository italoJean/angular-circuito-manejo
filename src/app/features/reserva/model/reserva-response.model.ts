import { EstadoReservaEnum } from "../enum/estado-reserva.enum";
import { Paquete } from "./paquete.model";
import { Usuario } from "./usuario.model";

export interface ReservaResponse {
  id: number;
  // usuario: Usuario;
  // paquete: Paquete;
  placaVehiculo:string;
  modeloVehiculo:string;
  numeroBoleta:string;
  minutosReservados:number;
  fechaReserva: Date;
  estado: EstadoReservaEnum;

}