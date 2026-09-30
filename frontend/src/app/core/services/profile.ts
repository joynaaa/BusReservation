import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = 'http://127.0.0.1:8000/api/auth/profile/';

  constructor(private http: HttpClient) {}

  getProfile() {

    const token = localStorage.getItem('access');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(
      this.apiUrl,
      { headers }
    );
  }

  updateProfile(data: any) {

    const token = localStorage.getItem('access');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put<any>(
      this.apiUrl,
      data,
      { headers }
    );
  }
}