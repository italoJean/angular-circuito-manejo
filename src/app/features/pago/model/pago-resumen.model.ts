import { PaqueteResumenDTO } from "../../paquete/model/paquete-resumen.model";
import { UsuarioResumenDTO } from "../../usuario/model/usuario-resumen.model";
import { EstadoPagoEnum } from "../enum/estado-pago.enum";

export interface PagoResumenDTO {
    id: number;
    usuario: UsuarioResumenDTO;
    paquete: PaqueteResumenDTO;
    numeroBoleta: string;
    monto: number;
    fechaPago: Date;
    estado:EstadoPagoEnum;
}