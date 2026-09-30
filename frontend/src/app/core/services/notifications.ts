
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl =
    'http://127.0.0.1:8000/api/notifications/';

  constructor(
    private http: HttpClient
  ) {}

  private getHeaders() {

    const token =
      localStorage.getItem('access');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  // Get all notifications
  getNotifications() {

    return this.http.get<any[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Get unread notification count
  getUnreadCount() {

    return this.http.get<any>(
      `${this.apiUrl}unread-count/`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Mark one notification as read
  markAsRead(notificationId: number) {

    return this.http.put<any>(
      `${this.apiUrl}${notificationId}/read/`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }


  // Mark all notifications as read
  markAllAsRead() {

    return this.http.put<any>(
      `${this.apiUrl}mark-all-read/`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }


  // Delete notification
  deleteNotification(notificationId: number) {

    return this.http.delete<any>(
      `${this.apiUrl}${notificationId}/delete/`,
      {
        headers: this.getHeaders()
      }
    );
  }
}

