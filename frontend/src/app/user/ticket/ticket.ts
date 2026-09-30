import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { TicketService } from '../../core/services/ticket';


@Component({
  selector: 'app-ticket',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './ticket.html',

  styleUrl: './ticket.css'
})


export class TicketComponent implements OnInit {

  bookingId!: number;

  ticket: any = null;

  loading = false;

  errorMessage = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.bookingId = Number(params['booking']);

      console.log(
        'Ticket Booking ID:',
        this.bookingId
      );


      if (!this.bookingId) {

        this.errorMessage =
          'Booking ID is missing.';

        return;
      }


      /*
       * After payment:
       *
       * /ticket?booking=12&generate=true
       *
       * From My Bookings:
       *
       * /ticket?booking=12
       */

      if (params['generate'] === 'true') {

        this.generateTicket();

      } else {

        this.loadTicket();

      }

    });

  }


  // ==========================================
  // GENERATE TICKET
  // ==========================================

  generateTicket(): void {

    this.loading = true;

    this.errorMessage = '';

    this.ticket = null;


    console.log(
      'Generating ticket for booking:',
      this.bookingId
    );


    this.ticketService
      .generateTicket(this.bookingId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'TICKET GENERATED SUCCESSFULLY:',
            response
          );


          this.ticket = response;

          this.loading = false;


          console.log(
            'Ticket assigned:',
            this.ticket
          );


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'TICKET GENERATION ERROR:',
            error
          );


          this.loading = false;


          const message =
            error?.error?.error ||
            error?.error?.detail ||
            error?.error?.message ||
            'Unable to generate ticket. Please try again.';


          this.errorMessage = message;


          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // LOAD EXISTING TICKET
  // ==========================================

  loadTicket(): void {

    this.loading = true;

    this.errorMessage = '';

    this.ticket = null;


    console.log(
      'Loading existing ticket for booking:',
      this.bookingId
    );


    this.ticketService
      .getTicket(this.bookingId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'EXISTING TICKET RESPONSE:',
            response
          );


          this.ticket = response;

          this.loading = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'GET TICKET ERROR:',
            error
          );


          this.loading = false;


          const message =
            error?.error?.error ||
            error?.error?.detail ||
            error?.error?.message ||
            'Ticket not found for this booking.';


          this.errorMessage = message;


          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // DOWNLOAD TICKET
  // ==========================================

  downloadTicket(): void {

    console.log('Preparing ticket for download...');

    window.print();

  }


  // ==========================================
  // BACK TO HOME
  // ==========================================

  goHome(): void {

    this.router.navigate(['/home']);

  }


  // ==========================================
  // MY BOOKINGS
  // ==========================================

  goToBookings(): void {

    this.router.navigate(['/my-bookings']);

  }

}