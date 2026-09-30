import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  private apiUrl =
    'http://127.0.0.1:8000/api/payments';

  private stripePromise = loadStripe(
    'pk_test_YOUR_PUBLISHABLE_KEY'
  );

  constructor(
    private http: HttpClient
  ) {}

  createPayment(
    bookingId: number
  ): Observable<any> {

    const token =
      localStorage.getItem('access');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    return this.http.post(
      `${this.apiUrl}/stripe/create/`,
      {
        booking_id: bookingId
      },
      {
        headers
      }
    );
  }

  async getStripe(): Promise<Stripe | null> {

    return await this.stripePromise;
  }
}