import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NotificationService } from '../../core/services/notifications';

@Component({
  selector: 'app-notifications',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent implements OnInit {

  notifications: any[] = [];

  unreadCount = 0;

  loading = false;

  errorMessage = '';


  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {
    this.loadNotifications();
  }


  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  loadNotifications(): void {

    this.loading = true;
    this.errorMessage = '';

    this.notificationService
      .getNotifications()
      .subscribe({

        next: (data: any[]) => {

          this.notifications = data || [];

          this.updateUnreadCount();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Notification error:',
            error
          );

          this.notifications = [];

          this.errorMessage =
            'Unable to load notifications. Please try again.';

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }


  // ==========================================
  // UPDATE UNREAD COUNT
  // ==========================================

  updateUnreadCount(): void {

    this.unreadCount =
      this.notifications.filter(
        notification => !notification.is_read
      ).length;
  }


  // ==========================================
  // MARK AS READ
  // ==========================================

  markAsRead(notification: any): void {

    if (!notification || notification.is_read) {
      return;
    }

    this.notificationService
      .markAsRead(notification.id)
      .subscribe({

        next: () => {

          notification.is_read = true;

          this.updateUnreadCount();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Mark read error:',
            error
          );

        }

      });
  }


  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  markAllAsRead(): void {

    if (this.unreadCount === 0) {
      return;
    }

    this.notificationService
      .markAllAsRead()
      .subscribe({

        next: () => {

          this.notifications.forEach(
            notification => {
              notification.is_read = true;
            }
          );

          this.updateUnreadCount();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Mark all read error:',
            error
          );

        }

      });
  }


  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  deleteNotification(
    notification: any
  ): void {

    if (!notification) {
      return;
    }

    this.notificationService
      .deleteNotification(notification.id)
      .subscribe({

        next: () => {

          this.notifications =
            this.notifications.filter(
              item =>
                item.id !== notification.id
            );

          this.updateUnreadCount();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Delete notification error:',
            error
          );

        }

      });
  }


  // ==========================================
  // GO HOME
  // ==========================================

  goHome(): void {

    this.router.navigate(['/home']);

  }


  // ==========================================
  // GO TO BOOKINGS
  // ==========================================

  goToBookings(): void {

    this.router.navigate(['/my-bookings']);

  }

}