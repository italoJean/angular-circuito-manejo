import { TipoEventoReservaEnum } from "../../enum/tipo-evento-reserva.enum";

export interface IncidenciaDTO {
    minutosReservadosAntes: number;
    minutosUsados: number;
    minutosDevueltos: number;
    minutosAfectados: number;
    detalle: string;
    fechaRegistro: Date;
    tipo: TipoEventoReservaEnum;
}