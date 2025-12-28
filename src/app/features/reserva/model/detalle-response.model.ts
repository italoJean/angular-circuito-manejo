import { PagoResumenDTO } from "../../pago/model/pago-resumen.model";
import { VehiculoResumenDTO } from "../../vehiculo/model/vehiculo.resumen.model";
import { EstadoReservaEnum } from "../enum/estado-reserva.enum";

export interface DetalleReservaResponse {
  id: number;
  pago:PagoResumenDTO;
  vehiculo: VehiculoResumenDTO;
  fechaReserva: Date;
  fechaFin: Date;
  estado: EstadoReservaEnum;
  minutosReservados:number;//ultimo por ver
}