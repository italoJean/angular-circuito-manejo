import { EstadoPagoEnum } from "../enum/estado-pago.enum";
import { MetodoPagoEnum } from "../enum/metodo-pago.enum";

export interface CuotaResponseDTO {
  numeroCuota: number;
  montoCuota: number;  
  fechaVencimiento: Date; 
  estadoCuota: EstadoPagoEnum;
  metodoPago: MetodoPagoEnum;
}
