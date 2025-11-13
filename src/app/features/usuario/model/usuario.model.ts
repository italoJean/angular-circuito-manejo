
import { TipoDocumentoEnum } from "../enums/tipo-documento.enum";

export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    tipoDocumento: TipoDocumentoEnum;
    numeroDocumento: string;
    telefono: number;
    email:string;
    fechaRegistro: Date;
}