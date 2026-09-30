import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  username = '';

  totalBuses = 0;
totalUsers = 0;
totalOperators = 0;
totalRoutes = 0;
totalBookings = 0;
totalRevenue = 0;
totalReviews = 0;
pendingOperators = 0;
todaysBookings = 0;
totalSchedules = 0;
recentBookings: any[] = [];
unreadCount = 0;
loading = false;
errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.username =
      localStorage.getItem('username') || 'Operator';

    this.loadDashboard();
  }
 goToNotifications(): void {
    this.router.navigate(['/admin/notifications']);
  }
 // ==========================================
// LOAD ADMIN DASHBOARD
// ==========================================

loadDashboard(): void {

  this.loading = true;
  this.errorMessage = '';

  this.authService.getAdminDashboard().subscribe({

    // ======================================
    // SUCCESS
    // ======================================

    next: (data: any) => {

      console.log(
        'ADMIN DASHBOARD API RESPONSE:',
        data
      );

      // -------------------------------
      // USERS
      // -------------------------------

      this.totalUsers =
        Number(data.totalUsers ?? 0);

      // -------------------------------
      // OPERATORS
      // -------------------------------

      this.totalOperators =
        Number(data.totalOperators ?? 0);

      // -------------------------------
      // BUSES
      // -------------------------------

      this.totalBuses =
        Number(data.totalBuses ?? 0);

      // -------------------------------
      // ROUTES
      // -------------------------------

      this.totalRoutes =
        Number(data.totalRoutes ?? 0);

      // -------------------------------
      // SCHEDULES
      // -------------------------------

      this.totalSchedules =
        Number(data.totalSchedules ?? 0);

      // -------------------------------
      // BOOKINGS
      // -------------------------------

      this.totalBookings =
        Number(data.totalBookings ?? 0);

      // -------------------------------
      // REVENUE
      // -------------------------------

      this.totalRevenue =
        Number(data.totalRevenue ?? 0);

      // -------------------------------
      // REVIEWS
      // -------------------------------

      this.totalReviews =
        Number(data.totalReviews ?? 0);

      // -------------------------------
      // PENDING OPERATORS
      // -------------------------------

      this.pendingOperators =
        Number(data.pendingOperators ?? 0);

      // -------------------------------
      // RECENT BOOKINGS
      // -------------------------------

      this.recentBookings =
        Array.isArray(data.recentBookings)
          ? data.recentBookings
          : [];

      // -------------------------------
      // PAGE STATE
      // -------------------------------

      this.loading = false;
      this.errorMessage = '';

      this.cdr.detectChanges();

    },

    // ======================================
    // ERROR
    // ======================================

    error: (error: any) => {

      console.error(
        'ADMIN DASHBOARD API ERROR:',
        error
      );

      this.loading = false;

      // -------------------------------
      // UNAUTHORIZED
      // -------------------------------

      if (error.status === 401) {

        this.errorMessage =
          'Your login session has expired. Please login again.';

      }

      // -------------------------------
      // FORBIDDEN
      // -------------------------------

      else if (error.status === 403) {

        this.errorMessage =
          'You do not have permission to access the admin dashboard.';

      }

      // -------------------------------
      // NOT FOUND
      // -------------------------------

      else if (error.status === 404) {

        this.errorMessage =
          'Admin dashboard API was not found. Please check the backend URL.';

      }

      // -------------------------------
      // OTHER ERRORS
      // -------------------------------

      else {

        this.errorMessage =
          'Unable to load dashboard data. Please try again.';

      }

      this.cdr.detectChanges();

    }

  });

}

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/']);
  }
}