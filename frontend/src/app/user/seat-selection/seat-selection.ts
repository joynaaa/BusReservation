import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { BusService } from '../../core/services/bus';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selection.html',
  styleUrl: './seat-selection.css'
})
export class SeatSelectionComponent implements OnInit {

  // ==========================================
  // BOOKING INFORMATION
  // ==========================================

  scheduleId: number = 0;
  busId: number = 0;

  fromStopId: number = 0;
  toStopId: number = 0;

  travelDate: string = '';

  fromStopName: string = '';
  toStopName: string = '';

  // ==========================================
  // SEATS
  // ==========================================

  seats: any[] = [];
  selectedSeats: any[] = [];

  fare: number = 0;

  // ==========================================
  // LOADING
  // ==========================================

  loading: boolean = false;
  holdingSeat: boolean = false;

  errorMessage: string = '';

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private route: ActivatedRoute,
    private busService: BusService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {

    // ========================================
    // GET ROUTE PARAMETERS
    // ========================================

    this.scheduleId = Number(
      this.route.snapshot.paramMap.get('scheduleId')
    );

    this.busId = Number(
      this.route.snapshot.paramMap.get('busId')
    );

    // ========================================
    // GET QUERY PARAMETERS
    // ========================================

    this.route.queryParams.subscribe(params => {

      // ======================================
      // FARE
      // ======================================

      this.fare = Number(params['fare']) || 0;

      // ======================================
      // TRAVEL DATE
      // ======================================

      this.travelDate = params['travel_date'] || '';

      // ======================================
      // FROM STOP
      // ======================================

      this.fromStopId =
        Number(params['from_stop']) || 0;

      // ======================================
      // TO STOP
      // ======================================

      this.toStopId =
        Number(params['to_stop']) || 0;

      // ======================================
      // STOP NAMES
      // ======================================

      this.fromStopName =
        params['from_stop_name'] || '';

      this.toStopName =
        params['to_stop_name'] || '';

      // ======================================
      // SESSION STORAGE FALLBACK
      // ======================================

      const storedData =
        sessionStorage.getItem('bookingStops');

      if (storedData) {

        try {

          const bookingStops =
            JSON.parse(storedData);

          // ====================================
          // RESTORE FROM STOP
          // ====================================

          if (
            !this.fromStopId &&
            bookingStops.schedule === this.scheduleId &&
            bookingStops.from_stop
          ) {

            this.fromStopId =
              Number(bookingStops.from_stop);

          }

          // ====================================
          // RESTORE TO STOP
          // ====================================

          if (
            !this.toStopId &&
            bookingStops.schedule === this.scheduleId &&
            bookingStops.to_stop
          ) {

            this.toStopId =
              Number(bookingStops.to_stop);

          }

          // ====================================
          // RESTORE TRAVEL DATE
          // ====================================

          if (
            !this.travelDate &&
            bookingStops.schedule === this.scheduleId &&
            bookingStops.travel_date
          ) {

            this.travelDate =
              bookingStops.travel_date;

          }

        } catch (error) {

          console.error(
            'Unable to read bookingStops:',
            error
          );

        }

      }

      // ======================================
      // DEBUG
      // ======================================

      console.log('========================================');
      console.log('SEAT SELECTION PARAMETERS');
      console.log('Schedule ID:', this.scheduleId);
      console.log('Bus ID:', this.busId);
      console.log('Travel Date:', this.travelDate);
      console.log('Fare:', this.fare);
      console.log('From Stop ID:', this.fromStopId);
      console.log('To Stop ID:', this.toStopId);
      console.log('========================================');

      // ======================================
      // VALIDATE PARAMETERS
      // ======================================

      if (
        !this.scheduleId ||
        Number.isNaN(this.scheduleId)
      ) {

        this.errorMessage =
          'Schedule information is missing.';

        return;
      }

      if (
        !this.busId ||
        Number.isNaN(this.busId)
      ) {

        this.errorMessage =
          'Bus information is missing.';

        return;
      }

      if (!this.travelDate) {

        this.errorMessage =
          'Travel date is missing. Please go back and select a travel date.';

        console.error(
          'Travel date is missing.'
        );

        return;
      }

      if (
        !this.fromStopId ||
        Number.isNaN(this.fromStopId)
      ) {

        this.errorMessage =
          'From stop information is missing.';

        return;
      }

      if (
        !this.toStopId ||
        Number.isNaN(this.toStopId)
      ) {

        this.errorMessage =
          'To stop information is missing.';

        return;
      }

      // ======================================
      // LOAD SEATS
      // ======================================

      this.loadSeats();

    });

  }

  // ==========================================
  // LOAD SEATS
  // ==========================================

  loadSeats(): void {

    console.log('========================================');
    console.log('Loading seats...');
    console.log('Bus ID:', this.busId);
    console.log('Schedule ID:', this.scheduleId);
    console.log('Travel Date:', this.travelDate);
    console.log('From Stop ID:', this.fromStopId);
    console.log('To Stop ID:', this.toStopId);
    console.log('========================================');

    // ========================================
    // VALIDATE TRAVEL DATE
    // ========================================

    if (!this.travelDate) {

      this.errorMessage =
        'Travel date is required.';

      return;
    }

    // ========================================
    // VALIDATE STOPS
    // ========================================

    if (
      !this.fromStopId ||
      !this.toStopId
    ) {

      this.errorMessage =
        'Boarding and dropping stops are required.';

      return;
    }

    // ========================================
    // START LOADING
    // ========================================

    this.loading = true;
    this.errorMessage = '';

    // ========================================
    // GET SEATS
    // ========================================

    this.busService
      .getSeats(
        this.busId,
        this.scheduleId,
        this.fromStopId,
        this.toStopId,
        this.travelDate
      )
      .subscribe({

        // ====================================
        // SUCCESS
        // ====================================

        next: (response: any[]) => {

          console.log(
            'SEAT API RESPONSE:',
            response
          );

          this.seats = response;

          this.loading = false;

          console.log(
            'Seats assigned:',
            this.seats
          );

          console.log(
            'Seat count:',
            this.seats.length
          );

          this.cdr.detectChanges();

        },

        // ====================================
        // ERROR
        // ====================================

        error: (error) => {

          console.error(
            'SEAT API ERROR:',
            error
          );

          this.loading = false;

          if (
            error?.error?.error
          ) {

            this.errorMessage =
              error.error.error;

          } else {

            this.errorMessage =
              'Unable to load seats. Please try again.';

          }

          this.cdr.detectChanges();

        },

        // ====================================
        // COMPLETE
        // ====================================

        complete: () => {

          console.log(
            'SEAT API REQUEST COMPLETED'
          );

        }

      });

  }

  // ==========================================
  // SELECT / HOLD SEAT
  // ==========================================

  selectSeat(seat: any): void {

    // ========================================
    // ALREADY BOOKED
    // ========================================

    if (seat.status === 'BOOKED') {

      alert(
        `Seat ${seat.seat_number} is already booked.`
      );

      return;

    }

    // ========================================
    // HELD BY ANOTHER USER
    // ========================================

    if (seat.status === 'HELD') {

      alert(
        `Seat ${seat.seat_number} is temporarily unavailable.`
      );

      return;

    }

    // ========================================
    // HELD BY CURRENT USER
    // ========================================

    if (seat.status === 'HELD_BY_ME') {

      const existingIndex =
        this.selectedSeats.findIndex(
          selected =>
            selected.id === seat.id
        );

      if (existingIndex >= 0) {

        this.selectedSeats.splice(
          existingIndex,
          1
        );

        seat.status = 'AVAILABLE';

      }

      return;

    }

    // ========================================
    // CHECK IF ALREADY SELECTED
    // ========================================

    const index =
      this.selectedSeats.findIndex(
        selected =>
          selected.id === seat.id
      );

    // ========================================
    // REMOVE SELECTION
    // ========================================

    if (index >= 0) {

      this.selectedSeats.splice(
        index,
        1
      );

      console.log(
        'Seat removed:',
        seat.seat_number
      );

      return;

    }

    // ========================================
    // PREVENT MULTIPLE HOLD REQUESTS
    // ========================================

    if (this.holdingSeat) {

      return;

    }

    // ========================================
    // VALIDATE TRAVEL DATE
    // ========================================

    if (!this.travelDate) {

      alert(
        'Travel date is missing.'
      );

      return;

    }

    // ========================================
    // VALIDATE STOPS
    // ========================================

    if (
      !this.fromStopId ||
      !this.toStopId
    ) {

      alert(
        'Boarding and dropping stops are missing.'
      );

      return;

    }

    // ========================================
    // START HOLD
    // ========================================

    this.holdingSeat = true;
    this.errorMessage = '';

    console.log(
      'Trying to hold seat:',
      seat.seat_number
    );

    console.log(
      'Travel Date:',
      this.travelDate
    );

    // ========================================
    // HOLD SEAT
    // ========================================

    this.busService
      .holdSeat(
        this.scheduleId,
        seat.id,
        this.fromStopId,
        this.toStopId,
        this.travelDate
      )
      .subscribe({

        // ====================================
        // SUCCESS
        // ====================================

        next: (response) => {

          console.log(
            'Seat hold successful:',
            response
          );

          // ==================================
          // MARK AS HELD BY ME
          // ==================================

          seat.status = 'HELD_BY_ME';

          // ==================================
          // ADD SELECTED SEAT
          // ==================================

          this.selectedSeats.push({

            ...seat,

            hold_id:
              response.hold_id,

            expires_at:
              response.expires_at

          });

          // ==================================
          // STOP HOLDING
          // ==================================

          this.holdingSeat = false;

          console.log(
            'Selected seats:',
            this.selectedSeats
          );

          alert(
            `Seat ${seat.seat_number} is held for 10 minutes.`
          );

          this.cdr.detectChanges();

        },

        // ====================================
        // ERROR
        // ====================================

        error: (error) => {

          console.error(
            'Seat hold error:',
            error
          );

          this.holdingSeat = false;

          const message =
            error?.error?.error ||
            'This seat is no longer available.';

          alert(message);

          // ==================================
          // REFRESH SEATS
          // ==================================

          this.loadSeats();

          this.cdr.detectChanges();

        }

      });

  }

  // ==========================================
  // CHECK SELECTED SEAT
  // ==========================================

  isSelected(seat: any): boolean {

    return this.selectedSeats.some(
      selected =>
        selected.id === seat.id
    );

  }

  // ==========================================
  // GET SEAT STATUS
  // ==========================================

  getSeatStatus(seat: any): string {

    return seat?.status || 'AVAILABLE';

  }

  // ==========================================
  // CONTINUE TO PASSENGER DETAILS
  // ==========================================

  continueBooking(): void {

    // ========================================
    // CHECK SEATS
    // ========================================

    if (this.selectedSeats.length === 0) {

      this.errorMessage =
        'Please select at least one seat.';

      return;

    }

    // ========================================
    // CHECK SCHEDULE
    // ========================================

    if (
      !this.scheduleId ||
      Number.isNaN(this.scheduleId)
    ) {

      this.errorMessage =
        'Schedule information is missing.';

      return;

    }

    // ========================================
    // CHECK BUS
    // ========================================

    if (
      !this.busId ||
      Number.isNaN(this.busId)
    ) {

      this.errorMessage =
        'Bus information is missing.';

      return;

    }

    // ========================================
    // CHECK TRAVEL DATE
    // ========================================

    if (!this.travelDate) {

      this.errorMessage =
        'Travel date is missing.';

      console.error(
        'Missing travelDate:',
        this.travelDate
      );

      return;

    }

    // ========================================
    // CHECK FROM STOP
    // ========================================

    if (
      !this.fromStopId ||
      Number.isNaN(this.fromStopId)
    ) {

      this.errorMessage =
        'From stop information is missing.';

      console.error(
        'Missing fromStopId:',
        this.fromStopId
      );

      return;

    }

    // ========================================
    // CHECK TO STOP
    // ========================================

    if (
      !this.toStopId ||
      Number.isNaN(this.toStopId)
    ) {

      this.errorMessage =
        'To stop information is missing.';

      console.error(
        'Missing toStopId:',
        this.toStopId
      );

      return;

    }

    // ========================================
    // GET SEAT IDs
    // ========================================

    const seatIds =
      this.selectedSeats.map(
        seat => seat.id
      );

    // ========================================
    // DEBUG
    // ========================================

    console.log('========================================');
    console.log('CONTINUE BOOKING');
    console.log('Schedule ID:', this.scheduleId);
    console.log('Bus ID:', this.busId);
    console.log('Travel Date:', this.travelDate);
    console.log('From Stop ID:', this.fromStopId);
    console.log('To Stop ID:', this.toStopId);
    console.log('Selected Seat IDs:', seatIds);
    console.log('========================================');

    // ========================================
    // STORE BOOKING INFORMATION
    // ========================================

    sessionStorage.setItem(
      'bookingStops',
      JSON.stringify({

        schedule:
          this.scheduleId,

        bus:
          this.busId,

        travel_date:
          this.travelDate,

        from_stop:
          this.fromStopId,

        to_stop:
          this.toStopId,

        from_stop_name:
          this.fromStopName,

        to_stop_name:
          this.toStopName,

        fare:
          this.fare

      })
    );

    // ========================================
    // GO TO PASSENGER DETAILS
    // ========================================

    this.router.navigate(
      ['/passenger-details'],
      {
        queryParams: {

          schedule:
            this.scheduleId,

          bus:
            this.busId,

          seats:
            seatIds.join(','),

          travel_date:
            this.travelDate,

          from_stop:
            this.fromStopId,

          to_stop:
            this.toStopId,

          from_stop_name:
            this.fromStopName,

          to_stop_name:
            this.toStopName,

          fare:
            this.fare

        }

      }
    );

  }

  // ==========================================
  // TOTAL FARE
  // ==========================================

  getTotal(): number {

    return (
      this.selectedSeats.length *
      this.fare
    );

  }

}