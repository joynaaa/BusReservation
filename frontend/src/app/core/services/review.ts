import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl =
    'http://127.0.0.1:8000/api/reviews';

  constructor(
    private http: HttpClient
  ) {}

  createReview(data: any) {

    const token =
      localStorage.getItem('access');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<any>(
      `${this.apiUrl}/create/`,
      data,
      { headers }
    );
  }

  getReviews() {

    return this.http.get<any[]>(
      `${this.apiUrl}/`
    );
  }

  getBusReviews(busId: number) {

  return this.http.get<any[]>(
    `${this.apiUrl}/bus/${busId}/`
  );

}

}