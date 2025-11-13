import { MetodoPagoEnum } from "../enum/metodo-pago.enum";

export interface PagoContadoRequestDTO {
  usuarioId: number;
  paqueteId: number;
  metodoPago: MetodoPagoEnum;
}
