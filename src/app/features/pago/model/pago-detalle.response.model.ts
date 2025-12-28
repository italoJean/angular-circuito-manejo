import { PaqueteResumenDTO } from "../../paquete/model/paquete-resumen.model";
import { UsuarioResumenDTO } from "../../usuario/model/usuario-resumen.model";
import { EstadoPagoEnum } from "../enum/estado-pago.enum";
import { MetodoPagoEnum } from "../enum/metodo-pago.enum";
import { TipoPagoEnum } from "../enum/tipo-pago.enum";
import { CuotaResponseDTO } from "./cuota-response.model";

export interface PagoDetalleResponseDTO {
  id: number;
   numeroBoleta: string;
   usuario:UsuarioResumenDTO;
   paquete:PaqueteResumenDTO;
   monto: number;
   tipoPago: TipoPagoEnum;
   estado: EstadoPagoEnum;
   fechaPago: Date;
   metodoPago:MetodoPagoEnum;
  cuotas: CuotaResponseDTO[];
}
