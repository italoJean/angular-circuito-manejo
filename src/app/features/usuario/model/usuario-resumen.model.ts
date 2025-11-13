
import { TipoDocumentoEnum } from "../enums/tipo-documento.enum";

export interface UsuarioResumenDTO {
    id: number;
    nombre: string;
    apellido: string;
    tipoDocumento: TipoDocumentoEnum;
    numeroDocumento: string;
    telefono: string;
    email:string;
}