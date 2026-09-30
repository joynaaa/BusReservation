import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl =
    'http://127.0.0.1:8000/api/payments';

  constructor(
    private http: HttpClient
  ) {}

  // =====================================================
  // CREATE STRIPE PAYMENT
  // =====================================================

  makePayment(
    bookingId: number,
    paymentMethod: string = 'STRIPE'
  ) {

    const token =
      localStorage.getItem('access');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(
      `${this.apiUrl}/stripe/create/`,
      {
        booking: bookingId,
        payment_method: paymentMethod
      },
      {
        headers
      }
    );
  }


  // =====================================================
  // VERIFY STRIPE PAYMENT
  // =====================================================

  verifyStripePayment(
    bookingId: number,
    paymentIntentId: string
  ) {

    const token =
      localStorage.getItem('access');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(
      `${this.apiUrl}/stripe/verify/`,
      {
        booking: bookingId,
        payment_intent_id: paymentIntentId
      },
      {
        headers
      }
    );
  }

}