import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent implements OnInit {

  totalBookings = 0;
  totalRevenue = 0;

  dailyBookings: any[] = [];
  monthlyBookings: any[] = [];
  popularRoutes: any[] = [];
  popularBuses: any[] = [];
  operatorPerformance: any[] = [];

  loading = true;


  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,

  private router: Router
  ) {}


  ngOnInit(): void {

    this.loadReports();

  }

goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}
  loadReports(): void {

    this.loading = true;

    this.authService.getAdminReports().subscribe({

      next: (data: any) => {

        console.log(
          'REPORTS API RESPONSE:',
          data
        );

        this.totalBookings =
          data.total_bookings;

        this.totalRevenue =
          Number(data.total_revenue);

        this.dailyBookings =
          data.daily_bookings;

        this.monthlyBookings =
          data.monthly_bookings;

        this.popularRoutes =
          data.popular_routes;

        this.popularBuses =
          data.popular_buses;

        this.operatorPerformance =
          data.operator_performance;

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'REPORTS API ERROR:',
          error
        );

        this.loading = false;

        this.cdr.detectChanges();

      }

    });

  }

}