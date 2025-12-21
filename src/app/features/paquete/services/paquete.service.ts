import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Paquete } from '../model/paquete.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaqueteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = `${environment.API_URL}/paquetes`;

  create(paquete: Paquete): Observable<Paquete> {
    return this.http.post<Paquete>(this.baseUrl, paquete);
  }

  findAll(): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(this.baseUrl);
  }

  findById(id: number): Observable<Paquete> {
    return this.http.get<Paquete>(`${this.baseUrl}/${id}`);
  }

  update(id: number, paquete: Paquete): Observable<Paquete> {
    return this.http.put<Paquete>(`${this.baseUrl}/${id}`, paquete);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  tienePagos(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${id}/tiene-pagos`);
  }
}
