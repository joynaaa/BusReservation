import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class BookingsComponent implements OnInit {

  // =====================================================
  // BOOKINGS
  // =====================================================

  bookings: any[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  loading: boolean = true;


  // =====================================================
  // ERROR
  // =====================================================

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

    this.loadBookings();

  }

goToDashboard(): void {
  this.router.navigate(['/operator/dashboard']);
}
  // =====================================================
  // LOAD OPERATOR BOOKINGS
  // =====================================================

  loadBookings(): void {

    this.loading = true;

    this.errorMessage = '';


    this.authService
      .getOperatorBookings()
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (data: any) => {

          console.log(
            'Operator bookings:',
            data
          );


          // Normal array response

          if (Array.isArray(data)) {

            this.bookings = [...data];

          }


          // Paginated response

          else if (
            data &&
            Array.isArray(data.results)
          ) {

            this.bookings = [
              ...data.results
            ];

          }


          // Invalid response

          else {

            this.bookings = [];

          }


          this.loading = false;


          // Update Angular UI

          this.cdr.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'Error loading operator bookings:',
            error
          );


          this.bookings = [];

          this.loading = false;


          this.errorMessage =
            error?.error?.error ||
            'Unable to load bookings.';


          this.cdr.detectChanges();

        }

      });

  }

}