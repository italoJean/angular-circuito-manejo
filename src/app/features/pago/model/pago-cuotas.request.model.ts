import { MetodoPagoEnum } from "../enum/metodo-pago.enum";

export interface PagoCuotasRequestDTO {
  usuarioId: number;
  paqueteId: number;
  metodoPago: MetodoPagoEnum;
  cuotas: number;
  montoPrimerPago: number;
}
