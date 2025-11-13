import { EstadoPagoEnum } from "../enum/estado-pago.enum";
import { TipoPagoEnum } from "../enum/tipo-pago.enum";

export interface PagoListadoResponseDTO {
  id: number;
  numeroBoleta: string;
  nombreUsuario: string;
  apellidoUsuario: string;
  nombrePaquete: string;
  monto: number;
  tipoPago: TipoPagoEnum;
  estado: EstadoPagoEnum;
  fechaPago: Date;
}
