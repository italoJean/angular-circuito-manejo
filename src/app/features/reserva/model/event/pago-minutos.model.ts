import { ReservaMinutosDTO } from "./reserva-minutos.model";

export interface PagoMinutosDTO {
    pagoId: number;
    minutosTotalesPaquete: number;
    minutosConsumidos: number;
    minutosDisponibles: number;
    reservas: ReservaMinutosDTO[];
}