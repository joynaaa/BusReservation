import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = 'http://127.0.0.1:8000/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(data: any) {

    const token = localStorage.getItem('access');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<any>(
      `${this.apiUrl}/`,
      data,
      { headers }
    );
  }

  getMyBookings() {

    const token = localStorage.getItem('access');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(
      `${this.apiUrl}/my-bookings/`,
      { headers }
    );
  }

  cancelBooking(bookingId: number) {

    const token = localStorage.getItem('access');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<any>(
      `${this.apiUrl}/${bookingId}/cancel/`,
      {},
      { headers }
    );
  }
}