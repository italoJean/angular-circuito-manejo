import { TipoDocumentoEnum } from "../../usuario/enums/tipo-documento.enum";

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumentoEnum; 
  numeroDocumento: string;
  telefono: number;
}
