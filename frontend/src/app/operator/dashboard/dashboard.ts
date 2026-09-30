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
  totalSchedules = 0;
  todaysBookings = 0;
  revenue = 0;

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

  loadDashboard(): void {

    this.authService.getOperatorDashboard().subscribe({

      next: (data: any) => {

        console.log(
          'OPERATOR DASHBOARD RESPONSE:',
          data
        );

        this.totalBuses = data.total_buses;
        this.totalSchedules = data.total_schedules;
        this.todaysBookings = data.todays_bookings;
        this.revenue = Number(data.revenue);

        this.cdr.detectChanges();
      },

      error: (error: any) => {

        console.error(
          'OPERATOR DASHBOARD ERROR:',
          error
        );

        this.cdr.detectChanges();
      }

    });
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/']);
  }
}