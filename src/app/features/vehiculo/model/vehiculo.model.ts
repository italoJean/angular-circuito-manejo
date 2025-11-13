import { EstadoVehiculosEnum } from '../enums/estado-vehiculo.enum';
import { TipoTransmisionEnum } from '../enums/tipo-transmision.enum';

export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  tipoTransmision: TipoTransmisionEnum;
  estado: EstadoVehiculosEnum;
}
