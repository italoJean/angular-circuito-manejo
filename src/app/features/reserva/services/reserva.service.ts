import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';

import { Observable } from 'rxjs';
import { ReservaRequest } from '../model/reserva-request.model';
import { ReservaResponse } from '../model/reserva-response.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly http=inject(HttpClient);
  private readonly baseUrl: string = `${environment.API_URL}/reservas`;
  
    create(reserva: ReservaRequest): Observable<ReservaResponse> {
      return this.http.post<ReservaResponse>(this.baseUrl, reserva);
    }

    findAll(): Observable<ReservaResponse[]> {
      return this.http.get<ReservaResponse[]>(this.baseUrl);
    }

    findById(id: number): Observable<ReservaResponse> {
      return this.http.get<ReservaResponse>(`${this.baseUrl}/${id}`);
    }

    update(id: number, reserva: ReservaRequest): Observable<ReservaResponse> {
      return this.http.put<ReservaResponse>(`${this.baseUrl}/${id}`, reserva);
    }
  
    delete(id: number): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
  }
  