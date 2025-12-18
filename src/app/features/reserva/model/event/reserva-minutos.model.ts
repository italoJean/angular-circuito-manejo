import { EstadoReservaEnum } from "../../enum/estado-reserva.enum";
import { IncidenciaDTO } from "./incidencia.model";

export interface ReservaMinutosDTO {
    reservaId: number;
    fechaReserva: Date;
    fechaFin: Date;
    minutosReservados: number;
    estado: EstadoReservaEnum;
    detalle: IncidenciaDTO[];
}