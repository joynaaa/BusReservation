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
  imports: [
    CommonModule
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent implements OnInit {

  // =====================================================
  // SUMMARY
  // =====================================================

  totalBookings: number = 0;

  totalRevenue: number = 0;


  // =====================================================
  // REPORT DATA
  // =====================================================

  popularBuses: any[] = [];

  popularRoutes: any[] = [];

  dailyBookings: any[] = [];

  monthlyBookings: any[] = [];


  // =====================================================
  // STATE
  // =====================================================

  loading: boolean = true;

  errorMessage: string = '';


  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadReports();

  }

goToDashboard(): void {
  this.router.navigate(['/operator/dashboard']);
}
  // =====================================================
  // LOAD REPORTS
  // =====================================================

  loadReports(): void {

    this.loading = true;

    this.errorMessage = '';


    this.authService
      .getOperatorReports()
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (data: any) => {

          console.log(
            'OPERATOR REPORT DATA:',
            data
          );


          this.totalBookings =
            Number(
              data?.total_bookings || 0
            );


          this.totalRevenue =
            Number(
              data?.total_revenue || 0
            );


          this.popularBuses =
            Array.isArray(
              data?.popular_buses
            )
              ? [...data.popular_buses]
              : [];


          this.popularRoutes =
            Array.isArray(
              data?.popular_routes
            )
              ? [...data.popular_routes]
              : [];


          this.dailyBookings =
            Array.isArray(
              data?.daily_bookings
            )
              ? [...data.daily_bookings]
              : [];


          this.monthlyBookings =
            Array.isArray(
              data?.monthly_bookings
            )
              ? [...data.monthly_bookings]
              : [];


          this.loading = false;


          this.cdr.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'Error loading operator reports:',
            error
          );


          this.loading = false;

          this.errorMessage =
            error?.error?.error ||
            'Unable to load reports.';


          this.cdr.detectChanges();

        }

      });

  }

}