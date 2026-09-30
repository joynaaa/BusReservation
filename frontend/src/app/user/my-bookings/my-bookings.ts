import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { BookingService } from '../../core/services/booking';


@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookingsComponent implements OnInit {

  bookings: any[] = [];

  loading = true;

  errorMessage = '';


  constructor(
    private bookingService: BookingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    console.log(
      'MY BOOKINGS COMPONENT LOADED'
    );

    this.loadBookings();

  }


  // ==========================================
  // LOAD MY BOOKINGS
  // ==========================================

  loadBookings(): void {

    console.log(
      'START LOADING BOOKINGS'
    );

    this.loading = true;

    this.errorMessage = '';


    this.bookingService
      .getMyBookings()
      .subscribe({

        // ======================================
        // SUCCESS
        // ======================================

        next: (response: any) => {

          console.log(
            'MY BOOKINGS API RESPONSE:',
            response
          );


          if (Array.isArray(response)) {

            this.bookings = response;

          }

          else if (
            response &&
            Array.isArray(response.results)
          ) {

            this.bookings =
              response.results;

          }

          else {

            this.bookings = [];

            console.error(
              'Unexpected bookings response:',
              response
            );

          }


          console.log(
            'BOOKINGS LENGTH:',
            this.bookings.length
          );


          this.loading = false;


          this.cdr.detectChanges();

        },


        // ======================================
        // ERROR
        // ======================================

        error: (error) => {

          console.error(
            'MY BOOKINGS API ERROR:',
            error
          );


          this.loading = false;


          this.errorMessage =
            error?.error?.error ||
            'Unable to load bookings. Please try again.';


          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // VIEW TICKET
  // ==========================================

  viewTicket(booking: any): void {

    console.log(
      'VIEW TICKET:',
      booking.id
    );


    this.router.navigate(
      ['/ticket'],
      {
        queryParams: {
          booking: booking.id
        }
      }
    );

  }


  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  cancelBooking(booking: any): void {

    if (
      booking.status === 'CANCELLED'
    ) {

      return;

    }


    const confirmed = confirm(
      `Are you sure you want to cancel Booking #${booking.id}?`
    );


    if (!confirmed) {

      return;

    }


    this.bookingService
      .cancelBooking(booking.id)
      .subscribe({

        // ====================================
        // SUCCESS
        // ====================================

        next: (response) => {

          console.log(
            'CANCEL RESPONSE:',
            response
          );


          alert(
            'Booking cancelled successfully.'
          );


          this.loadBookings();

        },


        // ====================================
        // ERROR
        // ====================================

        error: (error) => {

          console.error(
            'CANCEL ERROR:',
            error
          );


          alert(
            error?.error?.error ||
            'Unable to cancel booking.'
          );

        }

      });

  }


  // ==========================================
  // WRITE REVIEW
  // ==========================================

  writeReview(booking: any): void {

    console.log(
      'Writing review for booking:',
      booking.id
    );


    this.router.navigate(
      ['/reviews'],
      {
        queryParams: {
          booking: booking.id
        }
      }
    );

  }


  // ==========================================
  // GO HOME
  // ==========================================

  goHome(): void {

    this.router.navigate(
      ['/home']
    );

  }

}