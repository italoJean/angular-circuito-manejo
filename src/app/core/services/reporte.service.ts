import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:8080/api/reportes/dashboard-stats';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
