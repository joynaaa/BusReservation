
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private apiUrl =
    'http://127.0.0.1:8000/api/tickets/';

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // GENERATE TICKET AFTER PAYMENT
  // POST /api/tickets/
  // ==========================================

  generateTicket(bookingId: number) {

    const token =
      localStorage.getItem('access');

    const headers =
      new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

    return this.http.post<any>(
      this.apiUrl,
      {
        booking: bookingId
      },
      {
        headers: headers
      }
    );

  }


  // ==========================================
  // GET EXISTING TICKET
  // GET /api/tickets/<booking_id>/
  // ==========================================

  getTicket(bookingId: number) {

    const token =
      localStorage.getItem('access');

    const headers =
      new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

    return this.http.get<any>(
      `${this.apiUrl}${bookingId}/`,
      {
        headers: headers
      }
    );

  }

}

